package com.smartphoneai.service.impl;

import com.smartphoneai.dto.request.AiModelOptionsRequest;
import com.smartphoneai.dto.response.AiModelOptionsResponse;
import com.smartphoneai.dto.response.AiModelOptionsResponse.Option;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.service.AiModelCatalogService;
import com.smartphoneai.service.AiModelDirectory;
import com.smartphoneai.service.AiModelDirectory.ListedModel;
import com.smartphoneai.service.AiModelDirectory.RateLimits;
import com.smartphoneai.service.support.AiFreeTierEstimates;
import com.smartphoneai.service.support.AiProviders;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

/**
 * Lấy danh sách model chat của nền tảng và đề xuất tối đa 3 model có hạn mức miễn phí lớn nhất.
 * Groq: đọc hạn mức thật của tài khoản từ header. Gemini: ước tính theo dòng model.
 * DeepSeek: không có gói miễn phí nên chỉ liệt kê model khả dụng.
 * Kết quả được nhớ 10 phút theo nền tảng và key để không gọi thử Groq lặp lại.
 */
@Service
public class AiModelCatalogServiceImpl implements AiModelCatalogService {
    static final int TOP = 3;
    static final int MAX_GROQ_PROBES = 25;
    static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final Pattern GEMINI_VERSION = Pattern.compile("gemini-(\\d+(?:\\.\\d+)?)");
    private static final Comparator<Ranked> BY_FREE_USAGE = Comparator
            .comparing((Ranked r) -> r.limits() == null || r.limits().requestsPerDay() == null ? -1L : r.limits().requestsPerDay())
            .thenComparing(r -> r.limits() == null || r.limits().tokensPerMinute() == null ? -1L : r.limits().tokensPerMinute())
            .reversed();

    private record Ranked(ListedModel model, RateLimits limits) {
        Option option() {
            return new Option(model.id(), model.displayName(),
                    limits == null ? null : limits.requestsPerDay(), limits == null ? null : limits.tokensPerMinute());
        }
    }
    private record CacheEntry(AiModelOptionsResponse response, Instant expiresAt) {}

    private final AiProviderConfigRepository configs;
    private final ConfigSecretCipher cipher;
    private final AiModelDirectory directory;
    private final Clock clock;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public AiModelCatalogServiceImpl(AiProviderConfigRepository configs, ConfigSecretCipher cipher,
                                     AiModelDirectory directory, Clock clock) {
        this.configs = configs; this.cipher = cipher; this.directory = directory; this.clock = clock;
    }

    @Override
    public AiModelOptionsResponse options(AiModelOptionsRequest input) {
        String provider = input.provider();
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
        String key = resolveKey(provider, input.apiKey());
        String cacheKey = provider + ":" + AiQuotaTracker.fingerprint(key);
        var cached = cache.get(cacheKey);
        if (cached != null && clock.instant().isBefore(cached.expiresAt())) return cached.response();

        var models = directory.listChatModels(provider, key);
        var response = switch (provider) {
            case AiProviders.GROQ -> groq(models, key);
            case AiProviders.GEMINI -> gemini(models);
            default -> deepseek(models);
        };
        cache.put(cacheKey, new CacheEntry(response, clock.instant().plus(CACHE_TTL)));
        return response;
    }

    private String resolveKey(String provider, String apiKey) {
        if (apiKey != null && !apiKey.isBlank()) return apiKey.trim();
        var saved = configs.findFirstByProviderOrderByIdDesc(provider).orElseThrow(InvalidAiConfigurationException::new);
        return cipher.decrypt(saved.getProvider(), saved.getKeyCipher());
    }

    private AiModelOptionsResponse groq(List<ListedModel> models, String key) {
        var candidates = models.stream().limit(MAX_GROQ_PROBES).toList();
        var ranked = new ArrayList<Ranked>();
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var probes = new ArrayList<Future<Optional<RateLimits>>>();
            for (var model : candidates)
                probes.add(executor.submit(() -> directory.probeLimits(AiProviders.GROQ, model.id(), key)));
            for (int i = 0; i < candidates.size(); i++) {
                var model = candidates.get(i);
                try {
                    probes.get(i).get(20, TimeUnit.SECONDS).ifPresent(limits -> ranked.add(new Ranked(model, limits)));
                } catch (ExecutionException failure) {
                    // Key sai thì dừng hẳn; model lỗi riêng lẻ (chưa chấp nhận điều khoản, ngừng hỗ trợ) thì bỏ qua.
                    if (failure.getCause() instanceof AiProviderException error && error.isKeyFailure() && !error.isQuotaExceeded())
                        throw error;
                } catch (TimeoutException exception) {
                    probes.get(i).cancel(true);
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    throw new AiProviderException();
                }
            }
        }
        if (ranked.isEmpty()) {
            return response(AiProviders.GROQ, "NONE",
                    "Không đọc được hạn mức của tài khoản Groq; danh sách hiển thị theo thứ tự nhà cung cấp trả về.",
                    candidates.stream().limit(TOP).map(model -> new Ranked(model, null)).toList());
        }
        ranked.sort(BY_FREE_USAGE.thenComparing(r -> r.model().id()));
        return response(AiProviders.GROQ, "LIVE",
                "Hạn mức đọc trực tiếp từ tài khoản Groq: số lượt mỗi ngày (RPD) và token mỗi phút (TPM).",
                ranked.stream().limit(TOP).toList());
    }

    private AiModelOptionsResponse gemini(List<ListedModel> models) {
        var ranked = models.stream()
                .map(model -> new Ranked(model, AiFreeTierEstimates.gemini(model.id()).orElse(null)))
                .sorted(BY_FREE_USAGE
                        .thenComparing(Comparator.comparingDouble((Ranked r) -> geminiVersion(r.model().id())).reversed())
                        .thenComparing(r -> isPreview(r.model().id()))
                        .thenComparing(r -> r.model().id()))
                .limit(TOP).toList();
        return response(AiProviders.GEMINI, "ESTIMATE", AiFreeTierEstimates.GEMINI_NOTE, ranked);
    }

    private AiModelOptionsResponse deepseek(List<ListedModel> models) {
        var listed = models.stream().sorted(Comparator.comparing(ListedModel::id))
                .limit(TOP).map(model -> new Ranked(model, null)).toList();
        return response(AiProviders.DEEPSEEK, "NONE",
                "DeepSeek không có gói miễn phí, tính phí theo token; danh sách gồm các model chat khả dụng của tài khoản.", listed);
    }

    private AiModelOptionsResponse response(String provider, String source, String note, List<Ranked> ranked) {
        return new AiModelOptionsResponse(provider, source, note, ranked.stream().map(Ranked::option).toList(), clock.instant());
    }

    static double geminiVersion(String id) {
        var matcher = GEMINI_VERSION.matcher(id);
        return matcher.find() ? Double.parseDouble(matcher.group(1)) : 0;
    }

    private static boolean isPreview(String id) {
        return id.contains("preview") || id.contains("exp");
    }
}
