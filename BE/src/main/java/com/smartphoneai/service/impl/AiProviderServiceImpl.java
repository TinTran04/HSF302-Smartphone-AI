package com.smartphoneai.service.impl;

import com.smartphoneai.service.support.ConfigSecretCipher;
import com.smartphoneai.service.support.AiProviders;

import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.AiKeyAlertService;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.request.AiBackupKeyRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.dto.response.AiBackupKeyResponse;
import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.repository.AiBackupKeyRepository;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
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
    private final AiKeyAlertService alerts;
    private final AiBackupKeyRepository backups;
    private AiQuotaTracker quota;
    @org.springframework.beans.factory.annotation.Autowired
    public void setQuota(AiQuotaTracker quota) { this.quota=quota; }
    public AiProviderServiceImpl(AiProviderConfigRepository configs, SystemSettingRepository settings,
                             ConfigSecretCipher cipher, ChatProviderClient client, Clock clock, AiKeyAlertService alerts,
                             AiBackupKeyRepository backups) {
        this.configs=configs; this.settings=settings; this.cipher=cipher; this.client=client; this.clock=clock; this.alerts=alerts; this.backups=backups;
    }
    @Override
    @Transactional(readOnly=true)
    public List<AiSettingsResponse> list() {
        var configured = configs.findAllByOrderByIdDesc().stream()
                .filter(config -> AiProviders.isChatProvider(config.getProvider()))
                .map(this::response).toList();
        var result = new ArrayList<>(configured);
        for (String provider : AiProviders.CHAT) {
            if (configured.stream().noneMatch(config -> provider.equals(config.provider())))
                result.add(new AiSettingsResponse(provider, "", "", "", false, false));
        }
        return List.copyOf(result);
    }
    @Override
    @Transactional
    public AiSettingsResponse save(AiSettingsRequest input) {
        requireSupported(input.provider());
        settings.findLockedSingleton().orElseThrow();
        var old = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElse(null);
        requireCurrentVersion(input, old);
        String key = input.apiKey();
        if (key == null || key.isBlank()) {
            if (old == null) throw new InvalidAiConfigurationException();
            key = cipher.decrypt(old.getProvider(), old.getKeyCipher());
        } else {
            key = key.trim();
        }
        var draftKeys = resolveBackups(input, old);
        var distinctKeys = new HashSet<String>();
        distinctKeys.add(key);
        var distinctNames = new HashSet<String>();
        for (var draft : draftKeys) {
            if (!distinctKeys.add(cipher.decrypt(input.provider(), draft.keyCipher()))
                    || !distinctNames.add(draft.name().toLowerCase(Locale.ROOT))) throw new InvalidAiConfigurationException();
        }
        var config = configs.save(new AiProviderConfig(input.provider(), input.model().trim(),
                cipher.encrypt(input.provider(), key),
                draftKeys.isEmpty() ? null : draftKeys.getFirst().keyCipher(), clock.instant()));
        for (int index = 0; index < draftKeys.size(); index++) {
            var draft = draftKeys.get(index);
            backups.save(new AiBackupKey(config.getId(), draft.name(), index + 1, draft.keyCipher(), draft.maskedKey()));
        }
        return response(config);
    }
    @Override
    @Transactional
    public void test(AiSettingsRequest input) {
        var deadline = clock.instant().plusSeconds(60);
        requireSupported(input.provider());
        settings.findLockedSingleton().orElseThrow();
        var config = configs.findFirstByProviderOrderByIdDesc(input.provider()).orElseThrow(InvalidAiConfigurationException::new);
        requireCurrentVersion(input, config);
        if (!config.getModel().equals(input.model().trim())) throw new InvalidAiConfigurationException();
        String key = cipher.decrypt(config.getProvider(), config.getKeyCipher());
        if (input.apiKey() != null && !input.apiKey().isBlank() &&
                !sameKey(key, input.apiKey().trim()))
            throw new InvalidAiConfigurationException();
        var storedBackups = backups.findAllByConfigIdOrderByPriorityAsc(config.getId());
        String backupKey = storedBackups.isEmpty() ? null : cipher.decrypt(config.getProvider(), storedBackups.getFirst().getKeyCipher());
        if (input.backupApiKey() != null && !input.backupApiKey().isBlank() &&
                (backupKey == null || !sameKey(backupKey, input.backupApiKey().trim())))
            throw new InvalidAiConfigurationException();
        if (input.removeBackupKey() && !storedBackups.isEmpty()) throw new InvalidAiConfigurationException();
        if (input.backupKeys() != null) {
            var expected = resolveBackups(input, config);
            if (expected.size() != storedBackups.size()) throw new InvalidAiConfigurationException();
            for (int index = 0; index < expected.size(); index++) {
                if (!expected.get(index).name().equals(storedBackups.get(index).getName())
                        || !sameKey(cipher.decrypt(config.getProvider(), expected.get(index).keyCipher()),
                                cipher.decrypt(config.getProvider(), storedBackups.get(index).getKeyCipher()))) throw new InvalidAiConfigurationException();
            }
        }
        try {
            call(config, key, "Reply with OK.");
        } catch (AiProviderException exception) {
            if (!exception.isKeyFailure() || backupKey == null) throw exception;
        }
        AiProviderException backupFailure = null;
        for (var stored : storedBackups) {
            if (!clock.instant().isBefore(deadline)) throw new AiProviderException();
            try { callBackup(config, stored, "Reply with OK."); }
            catch (AiProviderException failure) { backupFailure = failure; }
        }
        if (backupFailure != null) throw backupFailure;
        config.markTested();
    }
    @Override
    @Transactional(readOnly = true)
    public void testBackupKey(Long configId, Long keyId) {
        var config = configs.findById(configId).orElseThrow(InvalidAiConfigurationException::new);
        requireSupported(config.getProvider());
        var key = backups.findById(keyId).filter(candidate -> candidate.getConfigId().equals(configId))
                .orElseThrow(InvalidAiConfigurationException::new);
        callBackup(config, key, "Reply with OK.");
    }
    @Override
    @Transactional
    public List<AiSettingsResponse> activate(String provider) {
        return activate(provider, null);
    }
    @Override
    @Transactional
    public List<AiSettingsResponse> activate(String provider, Long configId) {
        requireSupported(provider);
        settings.findLockedSingleton().orElseThrow();
        var selected = configs.findFirstByProviderOrderByIdDesc(provider).orElseThrow(InvalidAiConfigurationException::new);
        if (configId != null && !configId.equals(selected.getId())) throw new InvalidAiConfigurationException();
        if (!selected.isTested()) throw new InvalidAiConfigurationException();
        configs.findAllByActiveTrue().forEach(c -> c.setActive(false));
        selected.setActive(true);
        configs.flush();
        return list();
    }
    @Override
    public String chat(String prompt) {
        var deadline = clock.instant().plusSeconds(60);
        var active = configs.findAllByActiveTrue();
        if (active.size() != 1) throw new AiProviderException();
        var config = active.getFirst();
        requireSupported(config.getProvider());
        // Quota theo project chỉ áp dụng cho Gemini; Groq và DeepSeek dùng luồng key chính rồi key dự phòng.
        if (AiProviders.GEMINI.equals(config.getProvider()) && quota!=null && quota.configured())
            return chatWithRotation(prompt);
        String answer;
        try {
            answer = call(config, cipher.decrypt(config.getProvider(), config.getKeyCipher()), prompt);
        } catch (AiProviderException exception) {
            if (!exception.isKeyFailure()) throw exception;
            var storedBackups = backups.findAllByConfigIdOrderByPriorityAsc(config.getId());
            if (storedBackups.isEmpty()) {
                alerts.record(config.getId(), "MISSING_BACKUP", exception.getCode(), null);
                throw exception;
            }
            AiProviderException lastFailure = exception;
            String lastName = null;
            for (var backup : storedBackups) {
                if (!clock.instant().isBefore(deadline)) break;
                lastName = backup.getName();
                try {
                    answer = callBackup(config, backup, prompt);
                    alerts.record(config.getId(), "USING_BACKUP", exception.getCode(), null, backup.getName());
                    return answer;
                } catch (AiProviderException failure) {
                    lastFailure = failure;
                    if (!failure.isKeyFailure()) break;
                }
            }
            alerts.record(config.getId(), "BACKUP_FAILED", exception.getCode(), lastFailure.getCode(), lastName);
            throw lastFailure;
        }
        alerts.record(config.getId(), "PRIMARY", null, null);
        return answer;
    }

    private record RotationKey(String ref, String secret, AiBackupKey backup) {}
    private String chatWithRotation(String prompt) {
        var deadline=clock.instant().plusSeconds(60);
        var active=configs.findAllByActiveTrue();
        if (active.size()!=1) throw new AiProviderException();
        var config=active.getFirst();
        if (!AiProviders.GEMINI.equals(config.getProvider())) throw new InvalidAiConfigurationException();
        var remaining=new ArrayList<RotationKey>();
        remaining.add(new RotationKey("PRIMARY",cipher.decrypt("GEMINI",config.getKeyCipher()),null));
        for (var backup:backups.findAllByConfigIdOrderByPriorityAsc(config.getId()))
            remaining.add(new RotationKey(backup.getId().toString(),cipher.decrypt("GEMINI",backup.getKeyCipher()),backup));
        var excludedProjects=new HashSet<String>();
        AiProviderException last=null;
        String trigger="AI_QUOTA_NEAR_LIMIT";
        String lastName=null;
        while (!remaining.isEmpty() && clock.instant().isBefore(deadline)) {
            var keys=remaining.stream().map(key->new AiQuotaTracker.Key(key.ref(),AiQuotaTracker.fingerprint(key.secret()))).toList();
            var reservation=quota.reserve(keys,config.getModel(),prompt,excludedProjects);
            if (reservation==null) break;
            var chosen=remaining.stream().filter(key->key.ref().equals(reservation.reference())).findFirst().orElseThrow();
            remaining.remove(chosen);
            try {
                String result=availabilityRetry.execute(context -> {
                    var attempt=context.getRetryCount()==0 ? reservation : quota.reserve(
                            List.of(new AiQuotaTracker.Key(chosen.ref(),AiQuotaTracker.fingerprint(chosen.secret()))),
                            config.getModel(),prompt,Set.of());
                    if (client instanceof com.smartphoneai.service.UsageAwareChatProviderClient usageClient) {
                        var reply=usageClient.chatWithUsage("GEMINI",config.getModel(),chosen.secret(),prompt);
                        if (reply==null || reply.text()==null || reply.text().isBlank()) throw new AiProviderException();
                        quota.finish(attempt.usageId(),reply.inputTokens());
                        return reply.text();
                    }
                    var answer=client.chat("GEMINI",config.getModel(),chosen.secret(),prompt);
                    if (answer==null || answer.isBlank()) throw new AiProviderException();
                    return answer;
                });
                if (chosen.backup()!=null) {
                    alerts.recordBackupAttempt(chosen.backup().getId(),null);
                    alerts.record(config.getId(),"USING_BACKUP",trigger,null,chosen.backup().getName());
                } else alerts.record(config.getId(),"PRIMARY",null,null);
                return result;
            } catch (AiProviderException failure) {
                last=failure; lastName=chosen.backup()==null?null:chosen.backup().getName();
                if (chosen.backup()!=null) alerts.recordBackupAttempt(chosen.backup().getId(),failure.getCode());
                if (!failure.isKeyFailure()) {
                    if (chosen.backup()!=null) alerts.record(config.getId(),"BACKUP_FAILED",trigger,failure.getCode(),lastName);
                    throw failure;
                }
                if ("AI_QUOTA_NEAR_LIMIT".equals(trigger)) trigger=failure.getCode();
                if (failure.isQuotaExceeded() && reservation.project()!=null) excludedProjects.add(reservation.project());
            }
        }
        if (last==null) last=new AiProviderException(429);
        alerts.record(config.getId(),remaining.isEmpty() && lastName==null ? "MISSING_BACKUP" : "BACKUP_FAILED",trigger,last.getCode(),lastName);
        throw last;
    }

    private String call(AiProviderConfig config, String key, String prompt) {
        String result = availabilityRetry.execute(context ->
                client.chat(config.getProvider(), config.getModel(), key, prompt));
        if (result == null || result.isBlank()) throw new AiProviderException();
        return result;
    }

    private void requireSupported(String provider) {
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
    }

    private String callBackup(AiProviderConfig config, AiBackupKey backup, String prompt) {
        try {
            var answer = call(config, cipher.decrypt(config.getProvider(), backup.getKeyCipher()), prompt);
            alerts.recordBackupAttempt(backup.getId(), null);
            return answer;
        } catch (AiProviderException failure) {
            alerts.recordBackupAttempt(backup.getId(), failure.getCode());
            throw failure;
        }
    }

    private AiSettingsResponse response(AiProviderConfig config) {
        var stored = backups.findAllByConfigIdOrderByPriorityAsc(config.getId()).stream().map(AiBackupKeyResponse::from).toList();
        return new AiSettingsResponse(config.getProvider(), config.getModel(), "••••••••",
                stored.isEmpty() ? "" : "••••••••", config.isActive(), config.isTested(),
                config.getId() == null ? null : config.getId().toString(), stored);
    }

    private void requireCurrentVersion(AiSettingsRequest input, AiProviderConfig current) {
        if (input.configId() != null && (current == null || !input.configId().equals(current.getId()))) {
            throw new InvalidAiConfigurationException();
        }
    }

    private record BackupDraft(String name, String keyCipher, String maskedKey) {}

    private List<BackupDraft> resolveBackups(AiSettingsRequest input, AiProviderConfig previous) {
        var stored = previous == null ? List.<AiBackupKey>of() : backups.findAllByConfigIdOrderByPriorityAsc(previous.getId());
        boolean hasLegacyKey = input.backupApiKey() != null && !input.backupApiKey().isBlank();
        if (input.backupKeys() == null) {
            if (input.removeBackupKey()) {
                if (hasLegacyKey || stored.size() > 1) throw new InvalidAiConfigurationException();
                return List.of();
            }
            if (hasLegacyKey) {
                if (stored.size() > 1) throw new InvalidAiConfigurationException();
                return List.of(newBackup(input.provider(), "Dự phòng 1", input.backupApiKey().trim()));
            }
            return stored.stream().map(key -> new BackupDraft(key.getName(), key.getKeyCipher(), key.getMaskedKey())).toList();
        }
        if (hasLegacyKey || input.removeBackupKey() || input.backupKeys().size() > 10) throw new InvalidAiConfigurationException();
        var result = new ArrayList<BackupDraft>();
        var usedIds = new HashSet<Long>();
        for (AiBackupKeyRequest request : input.backupKeys()) {
            if (request == null || request.name() == null || request.name().isBlank() || request.name().trim().length() > 80)
                throw new InvalidAiConfigurationException();
            AiBackupKey existing = null;
            if (request.id() != null) {
                if (!usedIds.add(request.id())) throw new InvalidAiConfigurationException();
                existing = stored.stream().filter(key -> Objects.equals(key.getId(), request.id())).findFirst()
                        .orElseThrow(InvalidAiConfigurationException::new);
            }
            String secret = request.apiKey();
            if (secret != null && !secret.isBlank()) result.add(newBackup(input.provider(), request.name().trim(), secret.trim()));
            else if (existing != null) result.add(new BackupDraft(request.name().trim(), existing.getKeyCipher(), existing.getMaskedKey()));
            else throw new InvalidAiConfigurationException();
        }
        return result;
    }

    private BackupDraft newBackup(String provider, String name, String secret) {
        if (secret.length() > 2048) throw new InvalidAiConfigurationException();
        String mask = secret.length() >= 8 ? "••••" + secret.substring(secret.length() - 4) : "••••••••";
        return new BackupDraft(name, cipher.encrypt(provider, secret), mask);
    }

    private boolean sameKey(String first, String second) {
        return MessageDigest.isEqual(first.getBytes(StandardCharsets.UTF_8), second.getBytes(StandardCharsets.UTF_8));
    }
}
