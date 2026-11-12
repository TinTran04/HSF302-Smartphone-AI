package com.smartphoneai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.service.AiModelDirectory;
import com.smartphoneai.service.support.AiProviders;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.regex.Pattern;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Liệt kê model chat của Gemini, Groq, DeepSeek qua REST và đọc hạn mức Groq từ header. */
@Component
public class HttpAiModelDirectory implements AiModelDirectory {
    private static final Pattern GEMINI_EXCLUDED = Pattern.compile(
            "embedding|image|imagen|veo|tts|audio|live|robotics|computer-use|aqa");
    private static final Pattern GROQ_EXCLUDED = Pattern.compile(
            "whisper|tts|guard|orpheus|playai|distil|safeguard");
    private static final int MAX_GEMINI_PAGES = 5;

    private final Function<String, String> baseUrls;
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestClient http;

    public HttpAiModelDirectory() {
        this(HttpAiModelDirectory::officialBaseUrl);
    }

    /** Cho phép kiểm thử trỏ tới máy chủ giả lập. */
    public HttpAiModelDirectory(Function<String, String> baseUrls) {
        this.baseUrls = baseUrls;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(15_000);
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    static String officialBaseUrl(String provider) {
        return switch (provider) {
            case AiProviders.GEMINI -> "https://generativelanguage.googleapis.com";
            case AiProviders.GROQ, AiProviders.DEEPSEEK -> AiProviders.openAiCompatibleBaseUrl(provider);
            default -> throw new InvalidAiConfigurationException();
        };
    }

    @Override
    public List<ListedModel> listChatModels(String provider, String apiKey) {
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
        return AiProviders.GEMINI.equals(provider) ? listGemini(apiKey) : listOpenAiCompatible(provider, apiKey);
    }

    private List<ListedModel> listGemini(String apiKey) {
        var result = new ArrayList<ListedModel>();
        String pageToken = null;
        for (int page = 0; page < MAX_GEMINI_PAGES; page++) {
            String url = baseUrls.apply(AiProviders.GEMINI) + "/v1beta/models?pageSize=1000"
                    + (pageToken == null ? "" : "&pageToken=" + pageToken);
            JsonNode body = get(url, Map.of("x-goog-api-key", apiKey));
            for (JsonNode model : body.path("models")) {
                String id = model.path("name").asText("").replaceFirst("^models/", "");
                boolean generates = false;
                for (JsonNode method : model.path("supportedGenerationMethods"))
                    generates |= "generateContent".equals(method.asText());
                if (!generates || !id.startsWith("gemini-") || GEMINI_EXCLUDED.matcher(id).find()) continue;
                result.add(new ListedModel(id, model.path("displayName").asText(id)));
            }
            pageToken = body.path("nextPageToken").asText("");
            if (pageToken.isBlank()) break;
        }
        return result;
    }

    private List<ListedModel> listOpenAiCompatible(String provider, String apiKey) {
        String path = AiProviders.GROQ.equals(provider) ? "/v1/models" : "/models";
        JsonNode body = get(baseUrls.apply(provider) + path, Map.of(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey));
        var result = new ArrayList<ListedModel>();
        for (JsonNode model : body.path("data")) {
            String id = model.path("id").asText("");
            if (id.isBlank() || !model.path("active").asBoolean(true)) continue;
            if (AiProviders.GROQ.equals(provider) && GROQ_EXCLUDED.matcher(id.toLowerCase(Locale.ROOT)).find()) continue;
            result.add(new ListedModel(id, id));
        }
        return result;
    }

    @Override
    public Optional<RateLimits> probeLimits(String provider, String model, String apiKey) {
        if (!AiProviders.GROQ.equals(provider)) return Optional.empty();
        var body = Map.of("model", model, "max_tokens", 1,
                "messages", List.of(Map.of("role", "user", "content", "ping")));
        try {
            return http.post().uri(baseUrls.apply(provider) + "/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON).body(body)
                    .exchange((request, response) -> {
                        int status = response.getStatusCode().value();
                        if (status == 401 || status == 403)
                            throw AiProviderException.fromProvider(status, read(response.getBody()));
                        Long requests = number(response.getHeaders().getFirst("x-ratelimit-limit-requests"));
                        Long tokens = number(response.getHeaders().getFirst("x-ratelimit-limit-tokens"));
                        return requests == null && tokens == null
                                ? Optional.<RateLimits>empty() : Optional.of(new RateLimits(requests, tokens));
                    });
        } catch (RestClientException exception) {
            if (exception.getCause() instanceof AiProviderException providerError) throw providerError;
            return Optional.empty();
        }
    }

    private JsonNode get(String url, Map<String, String> headers) {
        try {
            return http.get().uri(url).headers(h -> headers.forEach(h::set)).exchange((request, response) -> {
                String text = read(response.getBody());
                if (response.getStatusCode().isError())
                    throw AiProviderException.fromProvider(response.getStatusCode().value(), text);
                return mapper.readTree(text);
            });
        } catch (RestClientException exception) {
            if (exception.getCause() instanceof AiProviderException providerError) throw providerError;
            throw new AiProviderException();
        }
    }

    private static String read(java.io.InputStream body) {
        try { return StreamUtils.copyToString(body, StandardCharsets.UTF_8); }
        catch (IOException ignored) { return ""; }
    }

    private static Long number(String header) {
        if (header == null || header.isBlank()) return null;
        try { return Long.parseLong(header.trim()); }
        catch (NumberFormatException ignored) { return null; }
    }
}
