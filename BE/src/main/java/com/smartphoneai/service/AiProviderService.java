package com.smartphoneai.service;

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

@Service
public class AiProviderService {
    private final AiProviderConfigRepository configs;
    private final SystemSettingRepository settings;
    private final ConfigSecretCipher cipher;
    private final ChatProviderClient client;
    private final Clock clock;
    public AiProviderService(AiProviderConfigRepository configs, SystemSettingRepository settings,
                             ConfigSecretCipher cipher, ChatProviderClient client, Clock clock) {
        this.configs=configs; this.settings=settings; this.cipher=cipher; this.client=client; this.clock=clock;
    }
    @Transactional(readOnly=true)
    public List<AiSettingsResponse> list() { return configs.findAllByOrderByIdDesc().stream().map(AiSettingsResponse::from).toList(); }
    @Transactional
    public AiSettingsResponse save(AiSettingsRequest input) {
        String key = input.apiKey();
        if (key == null || key.isBlank()) {
            var old = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElseThrow(InvalidAiConfigurationException::new);
            key = cipher.decrypt(old.getProvider(), old.getKeyCipher());
        }
        var config = configs.save(new AiProviderConfig(input.provider(), input.model().trim(), cipher.encrypt(input.provider(), key), clock.instant()));
        return AiSettingsResponse.from(config);
    }
    @Transactional
    public void test(AiSettingsRequest input) {
        var config = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElseThrow(InvalidAiConfigurationException::new);
        if (!config.getModel().equals(input.model().trim())) throw new InvalidAiConfigurationException();
        String key = cipher.decrypt(config.getProvider(), config.getKeyCipher());
        if (input.apiKey() != null && !input.apiKey().isBlank() &&
                !MessageDigest.isEqual(key.getBytes(StandardCharsets.UTF_8), input.apiKey().getBytes(StandardCharsets.UTF_8)))
            throw new InvalidAiConfigurationException();
        String answer = client.chat(config.getProvider(), config.getModel(), key, "Reply with OK.");
        if (answer == null || answer.isBlank()) throw new AiProviderException();
        config.markTested();
    }
    @Transactional
    public List<AiSettingsResponse> activate(String provider) {
        settings.findLockedSingleton().orElseThrow();
        var selected = configs.findFirstByProviderOrderByIdDesc(provider).orElseThrow(InvalidAiConfigurationException::new);
        if (!selected.isTested()) throw new InvalidAiConfigurationException();
        configs.findAllByActiveTrue().forEach(c -> c.setActive(false));
        selected.setActive(true);
        configs.flush();
        return list();
    }
    @Transactional(readOnly=true)
    public String chat(String prompt) {
        var active = configs.findAllByActiveTrue();
        if (active.size() != 1) throw new AiProviderException();
        var config = active.getFirst();
        String result = client.chat(config.getProvider(), config.getModel(),
                cipher.decrypt(config.getProvider(), config.getKeyCipher()), prompt);
        if (result == null || result.isBlank()) throw new AiProviderException();
        return result;
    }
}
