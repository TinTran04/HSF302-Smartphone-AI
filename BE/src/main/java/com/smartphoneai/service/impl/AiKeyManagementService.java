package com.smartphoneai.service.impl;

import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.support.AiProviders;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiKeyManagementService {
    public record KeyView(String keyRef, String identity, String name, String maskedKey,
                          int priority, Instant lastPrimaryAt) {}
    public record History(long id, String fromName, String fromMaskedKey, String toName,
                          String toMaskedKey, String actor, Instant changedAt) {}
    public record State(String configId, boolean active, List<KeyView> keys, List<History> history) {}
    private record Key(String ref, String fingerprint, String name, String masked, int priority) {}

    private final AiProviderConfigRepository configs;
    private final AiBackupKeyRepository backups;
    private final SystemSettingRepository settings;
    private final ConfigSecretCipher cipher;
    private final JdbcTemplate jdbc;
    private final Clock clock;

    public AiKeyManagementService(AiProviderConfigRepository configs, AiBackupKeyRepository backups,
                                  SystemSettingRepository settings, ConfigSecretCipher cipher,
                                  JdbcTemplate jdbc, Clock clock) {
        this.configs = configs;
        this.backups = backups;
        this.settings = settings;
        this.cipher = cipher;
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public State get(String provider) { return get(provider, null); }

    @Transactional(readOnly = true)
    public List<String> savedModels(String provider) {
        requireProvider(provider);
        return configs.findAllByOrderByIdDesc().stream().filter(config -> provider.equals(config.getProvider()))
                .map(AiProviderConfig::getModel).distinct().toList();
    }

    @Transactional(readOnly = true)
    public State get(String provider, Long before) {
        requireProvider(provider);
        var config = configs.findFirstByProviderOrderByIdDesc(provider).orElse(null);
        var views = new ArrayList<KeyView>();
        if (config != null) {
            for (var key : keys(config)) {
                var metadata = jdbc.query("SELECT name,last_primary_at FROM ai_key_identities WHERE provider=? AND key_fingerprint=?",
                        (rs, index) -> new KeyView(key.ref(), key.fingerprint(), rs.getString(1), key.masked(),
                                key.priority(), instant(rs.getTimestamp(2))), provider, key.fingerprint());
                views.add(metadata.isEmpty()
                        ? new KeyView(key.ref(), key.fingerprint(), key.name(), key.masked(), key.priority(), null)
                        : metadata.getFirst());
            }
        }
        var history = jdbc.query("SELECT id,from_name,from_masked_key,to_name,to_masked_key,actor,changed_at "
                        + "FROM ai_key_switch_history WHERE provider=? AND id<? ORDER BY id DESC LIMIT 50",
                (rs, index) -> new History(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4),
                        rs.getString(5), rs.getString(6), instant(rs.getTimestamp(7))), provider,
                before == null ? Long.MAX_VALUE : before);
        return new State(config == null ? null : config.getId().toString(), config != null && config.isActive(), views, history);
    }

    @Transactional
    public void markTested(Long configId) {
        settings.findLockedSingleton().orElseThrow();
        var config = current(configId);
        if (!config.hasKeys()) throw new InvalidAiConfigurationException();
        config.markTested();
    }

    @Transactional
    public void rename(Long configId, String keyRef, String name) {
        settings.findLockedSingleton().orElseThrow();
        var config = current(configId);
        remember(config);
        var key = keys(config).stream().filter(item -> item.ref().equals(keyRef)).findFirst()
                .orElseThrow(InvalidAiConfigurationException::new);
        String normalized = name.trim();
        if (normalized.isEmpty() || normalized.length() > 80) throw new InvalidAiConfigurationException();
        boolean duplicate = get(config.getProvider()).keys().stream()
                .anyMatch(other -> !other.identity().equals(key.fingerprint()) && other.name().equalsIgnoreCase(normalized));
        if (duplicate) throw new InvalidAiConfigurationException();
        jdbc.update("UPDATE ai_key_identities SET name=? WHERE provider=? AND key_fingerprint=?",
                normalized, config.getProvider(), key.fingerprint());
        if (!"PRIMARY".equals(keyRef)) {
            var backup = backups.findById(Long.valueOf(keyRef)).orElseThrow(InvalidAiConfigurationException::new);
            backup.rename(normalized);
        }
    }

    /** Creates a fresh snapshot so requests already in flight keep their original key set. */
    @Transactional
    public void promote(Long configId, Long keyId) {
        settings.findLockedSingleton().orElseThrow();
        var previous = current(configId);
        if (!previous.isActive() || !previous.isTested()) throw new InvalidAiConfigurationException();
        remember(previous);
        var stored = backups.findAllByConfigIdOrderByPriorityAsc(configId);
        var selected = stored.stream().filter(key -> key.getId().equals(keyId)).findFirst()
                .orElseThrow(InvalidAiConfigurationException::new);
        var identities = get(previous.getProvider()).keys();
        var primary = identities.stream().filter(key -> "PRIMARY".equals(key.keyRef())).findFirst().orElseThrow();
        var next = new AiProviderConfig(previous.getProvider(), previous.getModel(), selected.getKeyCipher(),
                null, clock.instant());
        next.markTested();
        next = configs.saveAndFlush(next);
        for (var backup : stored) {
            if (backup.getId().equals(keyId)) {
                backups.save(new AiBackupKey(next.getId(), primary.name(), backup.getPriority(),
                        previous.getKeyCipher(), primary.maskedKey()));
            } else {
                String name = identities.stream().filter(key -> key.keyRef().equals(backup.getId().toString()))
                        .findFirst().orElseThrow().name();
                var copy = new AiBackupKey(next.getId(), name, backup.getPriority(), backup.getKeyCipher(), backup.getMaskedKey());
                copy.copyOutcome(backup);
                backups.save(copy);
            }
        }
        var first = backups.findAllByConfigIdOrderByPriorityAsc(next.getId()).getFirst();
        next.setBackupKeyCipher(first.getKeyCipher());
        recordActivation(previous, next);
        previous.setActive(false);
        configs.flush();
        next.setActive(true);
        configs.flush();
    }

    /** Retains historical snapshots while removing the key from the current provider pool. */
    @Transactional
    public AiProviderConfig removePrimary(Long configId, String replacementKeyRef) {
        settings.findLockedSingleton().orElseThrow();
        var previous = current(configId);
        if (!previous.hasKeys()) throw new InvalidAiConfigurationException();
        var stored = backups.findAllByConfigIdOrderByPriorityAsc(configId);
        var selected = stored.stream().filter(key -> key.getId().toString().equals(replacementKeyRef))
                .findFirst().orElse(null);
        if ((!stored.isEmpty() && selected == null) || (stored.isEmpty() && replacementKeyRef != null))
            throw new InvalidAiConfigurationException();
        remember(previous);
        var next = configs.saveAndFlush(new AiProviderConfig(previous.getProvider(), previous.getModel(),
                selected == null ? null : selected.getKeyCipher(), null, clock.instant()));
        int priority = 1;
        for (var backup : stored) {
            if (backup == selected) continue;
            var copy = new AiBackupKey(next.getId(), backup.getName(), priority++, backup.getKeyCipher(), backup.getMaskedKey());
            copy.copyOutcome(backup);
            backups.save(copy);
            if (next.getBackupKeyCipher() == null) next.setBackupKeyCipher(copy.getKeyCipher());
        }
        if (selected != null && previous.isTested()) next.markTested();
        var active = configs.findAllByActiveTrue().stream()
                .filter(config -> config.getProvider().equals(previous.getProvider())).toList();
        if (selected != null) recordActivation(previous, next);
        active.forEach(config -> config.setActive(false));
        configs.flush();
        if (next.isTested() && !active.isEmpty()) next.setActive(true);
        configs.flush();
        return next;
    }

    /** Called while the existing global settings lock is held by save/activate/promote. */
    public void remember(AiProviderConfig config) {
        for (var key : keys(config)) {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM ai_key_identities WHERE provider=? AND key_fingerprint=?",
                    Integer.class, config.getProvider(), key.fingerprint());
            if (count != null && count == 0) {
                jdbc.update("INSERT INTO ai_key_identities(provider,key_fingerprint,name) VALUES(?,?,?)",
                        config.getProvider(), key.fingerprint(), key.name());
            } else if (!"PRIMARY".equals(key.ref())) {
                jdbc.update("UPDATE ai_key_identities SET name=? WHERE provider=? AND key_fingerprint=?",
                        key.name(), config.getProvider(), key.fingerprint());
            }
        }
    }

    public void recordActivation(AiProviderConfig previous, AiProviderConfig next) {
        if (previous != null) remember(previous);
        remember(next);
        var to = primary(next);
        var from = previous == null ? null : primary(previous);
        if (from != null && from.fingerprint().equals(to.fingerprint())) return;
        var now = Timestamp.from(clock.instant());
        jdbc.update("UPDATE ai_key_identities SET last_primary_at=? WHERE provider=? AND key_fingerprint=?",
                now, next.getProvider(), to.fingerprint());
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String actor = authentication == null ? "SYSTEM" : authentication.getName();
        jdbc.update("INSERT INTO ai_key_switch_history(provider,from_name,from_masked_key,to_name,to_masked_key,actor,changed_at) "
                        + "VALUES(?,?,?,?,?,?,?)", next.getProvider(), from == null ? null : from.name(),
                from == null ? null : from.masked(), to.name(), to.masked(), actor, now);
    }

    private Key primary(AiProviderConfig config) {
        var key = keys(config).getFirst();
        String name = jdbc.queryForObject("SELECT name FROM ai_key_identities WHERE provider=? AND key_fingerprint=?",
                String.class, config.getProvider(), key.fingerprint());
        return new Key(key.ref(), key.fingerprint(), name, key.masked(), 0);
    }

    private List<Key> keys(AiProviderConfig config) {
        if (!config.hasKeys()) return List.of();
        var result = new ArrayList<Key>();
        String secret = cipher.decrypt(config.getProvider(), config.getKeyCipher());
        result.add(new Key("PRIMARY", AiQuotaTracker.fingerprint(secret), "Key " + mask(secret), mask(secret), 0));
        for (var backup : backups.findAllByConfigIdOrderByPriorityAsc(config.getId())) {
            String value = cipher.decrypt(config.getProvider(), backup.getKeyCipher());
            result.add(new Key(backup.getId().toString(), AiQuotaTracker.fingerprint(value), backup.getName(),
                    mask(value), backup.getPriority()));
        }
        return result;
    }

    private AiProviderConfig current(Long configId) {
        var config = configs.findById(configId).orElseThrow(InvalidAiConfigurationException::new);
        requireProvider(config.getProvider());
        if (!Objects.equals(configs.findFirstByProviderOrderByIdDesc(config.getProvider()).orElseThrow().getId(), configId))
            throw new InvalidAiConfigurationException();
        return config;
    }

    private void requireProvider(String provider) {
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
    }

    private static String mask(String secret) {
        return secret.length() >= 8 ? "••••" + secret.substring(secret.length() - 4) : "••••••••";
    }

    private static Instant instant(Timestamp value) {
        return value == null ? null : value.toInstant();
    }
}
