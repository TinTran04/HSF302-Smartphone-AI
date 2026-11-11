package com.smartphoneai.service.impl;

import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.support.ConfigSecretCipher;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Clock;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiQuotaSettingsService {
    public record KeyInput(@NotBlank @Size(max=80) String keyRef, @Size(max=100) String projectName, @Positive Long tpmLimit) {}
    public record SaveInput(@NotNull @Positive Long configId, @NotNull @Size(max=11) List<@NotNull @Valid KeyInput> keys) {}
    public record KeyView(String keyRef, String name, String maskedKey, String projectName, Long tpmLimit, long estimatedInputTokens) {}
    public record Settings(String configId, String model, List<KeyView> keys) {}
    private record Key(String ref, String name, String masked, String fingerprint) {}
    private final AiProviderConfigRepository configs;
    private final AiBackupKeyRepository backups;
    private final SystemSettingRepository system;
    private final ConfigSecretCipher cipher;
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public AiQuotaSettingsService(AiProviderConfigRepository configs,AiBackupKeyRepository backups,SystemSettingRepository system,
                                  ConfigSecretCipher cipher,JdbcTemplate jdbc,Clock clock) {
        this.configs=configs; this.backups=backups; this.system=system; this.cipher=cipher; this.jdbc=jdbc; this.clock=clock;
    }
    @Transactional(readOnly=true)
    public Settings get() {
        var config=current();
        var result=new ArrayList<KeyView>();
        for (var key:keys(config)) {
            var rows=jdbc.query("SELECT p.id,p.project_name,l.tpm_limit FROM ai_quota_keys k JOIN ai_quota_projects p ON p.id=k.project_id LEFT JOIN ai_quota_project_limits l ON l.project_id=p.id AND l.model=? WHERE k.key_fingerprint=?",
                    (rs,n)->new Object[]{rs.getObject(1,UUID.class),rs.getString(2),rs.getObject(3,Long.class)},config.getModel(),key.fingerprint());
            if (rows.isEmpty()) { result.add(new KeyView(key.ref(),key.name(),key.masked(),null,null,0)); continue; }
            var row=rows.getFirst();
            Long used=jdbc.queryForObject("SELECT COALESCE(SUM(input_tokens),0) FROM ai_quota_usage WHERE project_id=? AND model=? AND created_at>=?",
                    Long.class,row[0],config.getModel(),java.sql.Timestamp.from(clock.instant().minusSeconds(60)));
            result.add(new KeyView(key.ref(),key.name(),key.masked(),(String)row[1],(Long)row[2],used==null?0:used));
        }
        return new Settings(config.getId().toString(),config.getModel(),List.copyOf(result));
    }
    @Transactional
    public Settings save(SaveInput input) {
        system.findLockedSingleton().orElseThrow();
        var config=current();
        if (!Objects.equals(config.getId(),input.configId())) throw new InvalidAiConfigurationException();
        var available=keys(config);
        var availableByRef=new HashMap<String,Key>(); available.forEach(key->availableByRef.put(key.ref(),key));
        var seen=new HashSet<String>(); var limits=new HashMap<String,Long>();
        for (var entry:input.keys()) {
            if (!availableByRef.containsKey(entry.keyRef()) || !seen.add(entry.keyRef())) throw new InvalidAiConfigurationException();
            String name=normalize(entry.projectName());
            if (name==null) { if (entry.tpmLimit()!=null) throw new InvalidAiConfigurationException(); continue; }
            if (entry.tpmLimit()==null || entry.tpmLimit()<=0 || entry.tpmLimit()>1_000_000_000L) throw new InvalidAiConfigurationException();
            var previous=limits.putIfAbsent(name,entry.tpmLimit());
            if (previous!=null && !previous.equals(entry.tpmLimit())) throw new InvalidAiConfigurationException();
        }
        if (seen.size()!=available.size()) throw new InvalidAiConfigurationException();
        for (var entry:input.keys()) {
            var key=availableByRef.get(entry.keyRef());
            jdbc.update("DELETE FROM ai_quota_keys WHERE key_fingerprint=?",key.fingerprint());
            String name=normalize(entry.projectName());
            if (name==null) continue;
            var projectIds=jdbc.query("SELECT id FROM ai_quota_projects WHERE project_name=?",
                    (rs,n)->rs.getObject(1,UUID.class),name);
            UUID id;
            if (projectIds.isEmpty()) {
                id=UUID.randomUUID();
                jdbc.update("INSERT INTO ai_quota_projects(id,project_name) VALUES(?,?)",id,name);
            } else {
                id=projectIds.getFirst();
            }
            int updated=jdbc.update("UPDATE ai_quota_project_limits SET tpm_limit=? WHERE project_id=? AND model=?",entry.tpmLimit(),id,config.getModel());
            if (updated==0) jdbc.update("INSERT INTO ai_quota_project_limits(project_id,model,tpm_limit) VALUES(?,?,?)",id,config.getModel(),entry.tpmLimit());
            jdbc.update("INSERT INTO ai_quota_keys(key_fingerprint,project_id) VALUES(?,?)",key.fingerprint(),id);
        }
        return get();
    }
    private AiProviderConfig current() {
        return configs.findFirstByProviderOrderByIdDesc("GEMINI").orElseThrow(InvalidAiConfigurationException::new);
    }
    private List<Key> keys(AiProviderConfig config) {
        var result=new ArrayList<Key>();
        result.add(new Key("PRIMARY","Key chính","••••••••",AiQuotaTracker.fingerprint(cipher.decrypt("GEMINI",config.getKeyCipher()))));
        for (AiBackupKey key:backups.findAllByConfigIdOrderByPriorityAsc(config.getId()))
            result.add(new Key(key.getId().toString(),key.getName(),key.getMaskedKey(),AiQuotaTracker.fingerprint(cipher.decrypt("GEMINI",key.getKeyCipher()))));
        return result;
    }
    private String normalize(String name) {
        if (name==null || name.isBlank()) return null;
        String normalized=name.trim().toLowerCase(Locale.ROOT);
        if (!normalized.matches("[a-z0-9][a-z0-9._-]{0,99}")) throw new InvalidAiConfigurationException();
        return normalized;
    }
}
