package com.smartphoneai.service.impl;

import com.smartphoneai.service.support.ConfigSecretCipher;

import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatProviderClient;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.util.List;
import org.springframework.retry.support.RetryTemplate;

@Service
public class AiProviderServiceImpl implements AiProviderService {
    private final RetryTemplate availabilityRetry = RetryTemplate.builder()
            .maxAttempts(2)
            .fixedBackoff(750)
            .retryOn(error -> error instanceof AiProviderException failure && failure.isServiceUnavailable())
            .build();
    private final AiProviderConfigRepository configs;
    private final SystemSettingRepository settings;
    private final ConfigSecretCipher cipher;
    private final ChatProviderClient client;
    private final Clock clock;
    public AiProviderServiceImpl(AiProviderConfigRepository configs, SystemSettingRepository settings,
                             ConfigSecretCipher cipher, ChatProviderClient client, Clock clock) {
        this.configs=configs; this.settings=settings; this.cipher=cipher; this.client=client; this.clock=clock;
    }
    @Override
    @Transactional(readOnly=true)
    public List<AiSettingsResponse> list() {
        var configured = configs.findAllByOrderByIdDesc().stream()
                .filter(config -> "GEMINI".equals(config.getProvider()))
                .map(AiSettingsResponse::from).toList();
        return configured.isEmpty()
                ? List.of(new AiSettingsResponse("GEMINI", "", "", "", false, false)) : configured;
    }
    @Override
    @Transactional
    public AiSettingsResponse save(AiSettingsRequest input) {
        requireGemini(input.provider());
        var old = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElse(null);
        String key = input.apiKey();
        if (key == null || key.isBlank()) {
            if (old == null) throw new InvalidAiConfigurationException();
            key = cipher.decrypt(old.getProvider(), old.getKeyCipher());
        } else {
            key = key.trim();
        }
        String backupKey = input.backupApiKey();
        if (input.removeBackupKey()) {
            if (backupKey != null && !backupKey.isBlank()) throw new InvalidAiConfigurationException();
            backupKey = null;
        } else if (backupKey == null || backupKey.isBlank()) {
            backupKey = old == null ? null : decryptBackupKey(old);
        } else {
            backupKey = backupKey.trim();
        }
        if (backupKey != null && sameKey(key, backupKey)) throw new InvalidAiConfigurationException();
        var config = configs.save(new AiProviderConfig(input.provider(), input.model().trim(),
                cipher.encrypt(input.provider(), key),
                backupKey == null ? null : cipher.encrypt(input.provider(), backupKey), clock.instant()));
        return AiSettingsResponse.from(config);
    }
    @Override
    @Transactional
    public void test(AiSettingsRequest input) {
        requireGemini(input.provider());
        var config = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElseThrow(InvalidAiConfigurationException::new);
        if (!config.getModel().equals(input.model().trim())) throw new InvalidAiConfigurationException();
        String key = cipher.decrypt(config.getProvider(), config.getKeyCipher());
        if (input.apiKey() != null && !input.apiKey().isBlank() &&
                !sameKey(key, input.apiKey().trim()))
            throw new InvalidAiConfigurationException();
        String backupKey = decryptBackupKey(config);
        if (input.backupApiKey() != null && !input.backupApiKey().isBlank() &&
                (backupKey == null || !sameKey(backupKey, input.backupApiKey().trim())))
            throw new InvalidAiConfigurationException();
        if (input.removeBackupKey() && backupKey != null) throw new InvalidAiConfigurationException();
        try {
            call(config, key, "Reply with OK.");
        } catch (AiProviderException exception) {
            if (!exception.isQuotaExceeded() || backupKey == null) throw exception;
        }
        if (backupKey != null) call(config, backupKey, "Reply with OK.");
        config.markTested();
    }
    @Override
    @Transactional
    public List<AiSettingsResponse> activate(String provider) {
        requireGemini(provider);
        settings.findLockedSingleton().orElseThrow();
        var selected = configs.findFirstByProviderOrderByIdDesc(provider).orElseThrow(InvalidAiConfigurationException::new);
        if (!selected.isTested()) throw new InvalidAiConfigurationException();
        configs.findAllByActiveTrue().forEach(c -> c.setActive(false));
        selected.setActive(true);
        configs.flush();
        return list();
    }
    @Override
    @Transactional(readOnly=true)
    public String chat(String prompt) {
        var active = configs.findAllByActiveTrue();
        if (active.size() != 1) throw new AiProviderException();
        var config = active.getFirst();
        requireGemini(config.getProvider());
        try {
            return call(config, cipher.decrypt(config.getProvider(), config.getKeyCipher()), prompt);
        } catch (AiProviderException exception) {
            if (!exception.isQuotaExceeded() || config.getBackupKeyCipher() == null) throw exception;
            return call(config, decryptBackupKey(config), prompt);
        }
    }

    private String call(AiProviderConfig config, String key, String prompt) {
        String result = availabilityRetry.execute(context ->
                client.chat(config.getProvider(), config.getModel(), key, prompt));
        if (result == null || result.isBlank()) throw new AiProviderException();
        return result;
    }

    private void requireGemini(String provider) {
        if (!"GEMINI".equals(provider)) throw new InvalidAiConfigurationException();
    }

    private String decryptBackupKey(AiProviderConfig config) {
        return config.getBackupKeyCipher() == null ? null
                : cipher.decrypt(config.getProvider(), config.getBackupKeyCipher());
    }

    private boolean sameKey(String first, String second) {
        return MessageDigest.isEqual(first.getBytes(StandardCharsets.UTF_8), second.getBytes(StandardCharsets.UTF_8));
    }
}
