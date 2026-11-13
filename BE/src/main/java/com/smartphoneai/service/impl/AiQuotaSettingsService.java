package com.smartphoneai.service.impl;

import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.support.AiProviders;
import com.smartphoneai.service.support.ConfigSecretCipher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiQuotaSettingsService {
    public record KeyInput(@NotBlank @Size(max=80) String keyRef, @Size(max=100) String projectName, @Positive Long tpmLimit) {}
    public record SaveInput(@NotNull @Positive Long configId, @NotNull @Size(max=11) List<@NotNull @Valid KeyInput> keys,
                            @Pattern(regexp=AiProviders.CHAT_PATTERN) String provider) {
        public SaveInput(Long configId, List<KeyInput> keys) { this(configId, keys, "GEMINI"); }
    }
    public record KeyView(String keyRef, String name, String maskedKey, String projectName, Long tpmLimit,
                          long estimatedInputTokens, String limitSource, String status, String reason,
                          Instant checkedAt, Instant retryAt, Instant lastUsedAt,
                          long requestsToday, Long dailyRequestLimit, String dailyLimitSource,
                          Instant dailyResetAt, Instant dailyTrackingSince) {
        public KeyView(String keyRef, String name, String maskedKey, String projectName, Long tpmLimit,
                       long tokens, String source, String status, String reason, Instant checked, Instant retry, Instant used) {
            this(keyRef, name, maskedKey, projectName, tpmLimit, tokens, source, status, reason, checked, retry, used,
                    0, null, "NONE", null, null);
        }
        public KeyView(String keyRef, String name, String maskedKey, String projectName, Long tpmLimit, long used) {
            this(keyRef, name, maskedKey, projectName, tpmLimit, used, "MANUAL", "UNKNOWN", null, null, null, null);
        }
    }
    public record Settings(String configId, String model, List<KeyView> keys, String provider) {
        public Settings(String configId, String model, List<KeyView> keys) { this(configId, model, keys, "GEMINI"); }
    }
    public record Key(String ref, String name, String masked, String fingerprint) {}
    private final AiProviderConfigRepository configs;
    private final AiBackupKeyRepository backups;
    private final SystemSettingRepository system;
    private final ConfigSecretCipher cipher;
    private final AiQuotaTracker tracker;
    private final AiDailyQuotaService daily;

    public AiQuotaSettingsService(AiProviderConfigRepository configs, AiBackupKeyRepository backups, SystemSettingRepository system,
                                  ConfigSecretCipher cipher, JdbcTemplate jdbc, Clock clock) {
        this.configs = configs; this.backups = backups; this.system = system; this.cipher = cipher;
        this.tracker = new AiQuotaTracker(jdbc, clock);
        this.daily = new AiDailyQuotaService(jdbc, clock);
    }

    @Transactional(readOnly = true)
    public Settings get() { return get("GEMINI", null); }

    @Transactional(readOnly = true)
    public Settings get(String provider, String selectedModel) {
        requireProvider(provider);
        var config = current(provider);
        String model = selectedModel == null ? config.getModel() : selectedModel.trim();
        if (model.isEmpty() || model.length() > 255) throw new InvalidAiConfigurationException();
        var result = new ArrayList<KeyView>();
        for (var key : keys(config, provider)) {
            var group = tracker.group(provider, key.fingerprint(), model, false);
            var state = tracker.state(provider, model, key.fingerprint());
            var dailyUsage = daily.get(provider, model, key.fingerprint());
            Long limit = group == null ? AiQuotaTracker.defaultLimit(provider, model) : group.limit();
            String source = group == null ? limit == null ? "NONE" : "DEFAULT" : group.source();
            result.add(new KeyView(key.ref(), key.name(), key.masked(), group == null ? null : group.name(), limit,
                    group == null ? 0 : tracker.used(group.id(), model), source, state.status(), state.reason(),
                    state.checkedAt(), state.retryAt(), state.lastUsedAt(), dailyUsage.requestsToday(),
                    dailyUsage.dailyRequestLimit(), dailyUsage.dailyLimitSource(), dailyUsage.dailyResetAt(),
                    dailyUsage.dailyTrackingSince()));
        }
        return new Settings(config.getId().toString(), model, List.copyOf(result), provider);
    }

    @Transactional
    public Settings save(SaveInput input) {
        String provider = input.provider() == null ? "GEMINI" : input.provider();
        requireProvider(provider);
        system.findLockedSingleton().orElseThrow();
        var config = current(provider);
        if (!Objects.equals(config.getId(), input.configId())) throw new InvalidAiConfigurationException();
        var available = keys(config, provider);
        var availableByRef = new HashMap<String, Key>();
        available.forEach(key -> availableByRef.put(key.ref(), key));
        var seen = new HashSet<String>();
        var limits = new HashMap<String, Long>();
        for (var entry : input.keys()) {
            if (!availableByRef.containsKey(entry.keyRef()) || !seen.add(entry.keyRef())) throw new InvalidAiConfigurationException();
            String name = normalize(entry.projectName());
            validateLimit(entry.tpmLimit());
            if ((name == null) != (entry.tpmLimit() == null)) throw new InvalidAiConfigurationException();
            if (name != null) {
                var previous = limits.putIfAbsent(name, entry.tpmLimit());
                if (previous != null && !previous.equals(entry.tpmLimit())) throw new InvalidAiConfigurationException();
            }
        }
        if (seen.size() != available.size()) throw new InvalidAiConfigurationException();
        for (var entry : input.keys()) {
            var key = availableByRef.get(entry.keyRef());
            tracker.configure(provider, key.fingerprint(), config.getModel(), normalize(entry.projectName()), entry.tpmLimit(), "MANUAL");
        }
        return get(provider, null);
    }

    /** Used by the atomic key editor; ungrouped keys can still have an application limit. */
    public void configureKey(AiProviderConfig config, String keyRef, String projectName, Long limit, boolean useDefault) {
        String provider = config.getProvider();
        var key = keys(config, provider).stream().filter(item -> item.ref().equals(keyRef)).findFirst()
                .orElseThrow(InvalidAiConfigurationException::new);
        String groupName = normalize(projectName);
        validateLimit(limit);
        String source = "MANUAL";
        if (useDefault) {
            Long observed = tracker.observedLimit(provider,key.fingerprint(),config.getModel());
            if (observed != null) {
                limit = observed; source = "PROVIDER";
            } else {
                limit = AiQuotaTracker.defaultLimit(provider, config.getModel()); source = "DEFAULT";
            }
        }
        tracker.configure(provider, key.fingerprint(), config.getModel(), groupName, limit, source);
    }

    public void configureDailyKey(AiProviderConfig config, String keyRef, Long limit, Boolean useDefault) {
        var key = keys(config, config.getProvider()).stream().filter(item -> item.ref().equals(keyRef)).findFirst()
                .orElseThrow(InvalidAiConfigurationException::new);
        daily.configure(config.getProvider(), config.getModel(), key.fingerprint(), limit, useDefault);
    }

    public AiDailyQuotaService.Usage dailyUsage(String provider, String model, String fingerprint) {
        return daily.get(provider, model, fingerprint);
    }

    public List<Key> keys(AiProviderConfig config, String provider) {
        if (!config.hasKeys()) return List.of();
        var result = new ArrayList<Key>();
        String secret = cipher.decrypt(provider, config.getKeyCipher());
        result.add(new Key("PRIMARY", "Key chính", mask(secret), AiQuotaTracker.fingerprint(secret)));
        for (var key : backups.findAllByConfigIdOrderByPriorityAsc(config.getId())) {
            result.add(new Key(key.getId().toString(), key.getName(), key.getMaskedKey(),
                    AiQuotaTracker.fingerprint(cipher.decrypt(provider, key.getKeyCipher()))));
        }
        return result;
    }

    private AiProviderConfig current(String provider) {
        return configs.findFirstByProviderOrderByIdDesc(provider).orElseThrow(InvalidAiConfigurationException::new);
    }
    public static String normalize(String name) {
        if (name == null || name.isBlank()) return null;
        String normalized = name.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("[a-z0-9][a-z0-9._-]{0,99}")) throw new InvalidAiConfigurationException();
        return normalized;
    }
    public static void validateLimit(Long limit) {
        if (limit != null && (limit <= 0 || limit > 1_000_000_000L)) throw new InvalidAiConfigurationException();
    }
    private static void requireProvider(String provider) {
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
    }
    private static String mask(String secret) {
        return secret.length() >= 8 ? "••••" + secret.substring(secret.length() - 4) : "••••••••";
    }
}
