package com.smartphoneai.service.impl;

import com.smartphoneai.dto.request.AiBackupKeyRequest;
import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.*;
import com.smartphoneai.service.support.AiProviders;
import com.smartphoneai.service.support.ConfigSecretCipher;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Checks credentials outside transactions, then atomically applies a versioned key and its quota. */
@Service
public class AiKeyEditorService {
    public record EditRequest(@NotBlank @Pattern(regexp=AiProviders.CHAT_PATTERN) String provider,
            @Positive Long configId, @NotBlank @Size(max=255) String model, @Size(max=80) String keyRef,
            @NotBlank @Size(max=80) String name, @Size(max=2048) String apiKey,
            @Size(max=100) String projectName, @Positive Long tpmLimit, boolean useDefault,
            @Positive Long dailyRequestLimit, Boolean useDefaultDaily) {
        public EditRequest(String provider, Long configId, String model, String keyRef, String name, String apiKey,
                           String projectName, Long tpmLimit, boolean useDefault) {
            this(provider, configId, model, keyRef, name, apiKey, projectName, tpmLimit, useDefault, null, null);
        }
    }
    private final AiProviderConfigRepository configs;
    private final AiBackupKeyRepository backups;
    private final SystemSettingRepository system;
    private final AiProviderService providers;
    private final AiKeyManagementService keys;
    private final AiQuotaSettingsService quota;
    private final AiQuotaTracker tracker;
    private final ChatProviderClient client;
    private final ConfigSecretCipher cipher;
    private final AiActivityLogService activity;
    private final TransactionTemplate transaction;
    private AiDailyQuotaService dailyQuota;
    @org.springframework.beans.factory.annotation.Autowired
    public void setDailyQuota(AiDailyQuotaService dailyQuota) { this.dailyQuota = dailyQuota; }

    public AiKeyEditorService(AiProviderConfigRepository configs, AiBackupKeyRepository backups,
            SystemSettingRepository system, AiProviderService providers, AiKeyManagementService keys,
            AiQuotaSettingsService quota, AiQuotaTracker tracker, ChatProviderClient client, ConfigSecretCipher cipher,
            AiActivityLogService activity, PlatformTransactionManager transactionManager) {
        this.configs=configs; this.backups=backups; this.system=system; this.providers=providers; this.keys=keys;
        this.quota=quota; this.tracker=tracker; this.client=client; this.cipher=cipher; this.activity=activity;
        transaction=new TransactionTemplate(transactionManager);
    }

    public AiSettingsResponse edit(EditRequest input) {
        requireValid(input);
        var current=current(input.provider(),input.configId());
        String replacement=input.apiKey()==null?null:input.apiKey().trim();
        boolean changedSecret=replacement!=null&&!replacement.isEmpty();
        var rememberedQuota = changedSecret ? tracker.group(input.provider(),AiQuotaTracker.fingerprint(replacement),input.model().trim(),false) : null;
        var rememberedDaily = changedSecret
                ? quota.dailyUsage(input.provider(), input.model().trim(), AiQuotaTracker.fingerprint(replacement)) : null;
        if (current==null&&!changedSecret) throw new InvalidAiConfigurationException();
        if (current!=null&&!current.getModel().equals(input.model().trim())) throw new InvalidAiConfigurationException();
        if (current!=null&&input.keyRef()!=null && (current.hasKeys() || !"PRIMARY".equals(input.keyRef()) || !changedSecret))
            quota.keys(current,input.provider()).stream().filter(key->key.ref().equals(input.keyRef())).findFirst()
                    .orElseThrow(InvalidAiConfigurationException::new);
        if (input.keyRef()==null&&current!=null&&backups.findAllByConfigIdOrderByPriorityAsc(current.getId()).size()>=10)
            throw new InvalidAiConfigurationException();
        if (input.keyRef()==null&&!changedSecret) throw new InvalidAiConfigurationException();
        if (changedSecret) check(input.provider(),input.model().trim(),replacement);
        var saved=transaction.execute(status -> {
            system.findLockedSingleton().orElseThrow();
            var previous=current(input.provider(),input.configId());
            var draft=new ArrayList<AiBackupKeyRequest>();
            if (previous!=null) for(var backup:backups.findAllByConfigIdOrderByPriorityAsc(previous.getId())) {
                boolean selected=backup.getId().toString().equals(input.keyRef());
                draft.add(new AiBackupKeyRequest(backup.getId(),selected?input.name().trim():backup.getName(),
                        selected&&changedSecret?replacement:null));
            }
            boolean primary=previous==null||!previous.hasKeys()||"PRIMARY".equals(input.keyRef());
            if (!primary&&input.keyRef()==null) draft.add(new AiBackupKeyRequest(null,input.name().trim(),replacement));
            boolean wasActive=previous!=null&&previous.isActive();
            var result=providers.save(new AiSettingsRequest(input.provider(),input.model().trim(),
                    primary&&changedSecret?replacement:null,null,false,draft,input.configId()));
            var next=configs.findById(Long.valueOf(result.id())).orElseThrow();
            String ref=primary?"PRIMARY":backups.findAllByConfigIdOrderByPriorityAsc(next.getId()).stream()
                    .filter(backup->backup.getName().equals(input.name().trim())).findFirst().orElseThrow().getId().toString();
            keys.rename(next.getId(),ref,input.name());
            if (changedSecret && input.useDefault() && (input.projectName()==null || input.projectName().isBlank())
                    && rememberedQuota!=null && (rememberedQuota.name()!=null || rememberedQuota.limit()!=null)) {
                tracker.configure(input.provider(),AiQuotaTracker.fingerprint(replacement),input.model().trim(),
                        rememberedQuota.name(),rememberedQuota.limit(),rememberedQuota.source());
            } else quota.configureKey(next,ref,input.projectName(),input.tpmLimit(),input.useDefault());
            if (changedSecret && rememberedQuota != null && Boolean.TRUE.equals(input.useDefaultDaily())
                    && (input.projectName()==null || input.projectName().isBlank())
                    && "MANUAL".equals(rememberedDaily.dailyLimitSource())) {
                quota.configureDailyKey(next, ref, rememberedDaily.dailyRequestLimit(), false);
            } else quota.configureDailyKey(next,ref,input.dailyRequestLimit(),input.useDefaultDaily());
            if (previous==null||!previous.hasKeys()||previous.isTested()) next.markTested();
            if (wasActive) providers.activate(input.provider(),next.getId());
            activity.record(input.provider(),input.model().trim(),input.keyRef()==null?"KEY_ADDED":"KEY_EDITED",
                    input.name().trim(),changedSecret?mask(replacement):"••••••••",null,actor());
            return providers.list().stream().filter(setting->setting.id().equals(result.id())).findFirst().orElseThrow();
        });
        return saved;
    }

    public void checkKey(Long configId,String keyRef) {
        var config=configs.findById(configId).orElseThrow(InvalidAiConfigurationException::new);
        current(config.getProvider(),configId);
        var key=quota.keys(config,config.getProvider()).stream().filter(item->item.ref().equals(keyRef)).findFirst()
                .orElseThrow(InvalidAiConfigurationException::new);
        String secret="PRIMARY".equals(keyRef)?cipher.decrypt(config.getProvider(),config.getKeyCipher())
                :cipher.decrypt(config.getProvider(),backups.findById(Long.valueOf(keyRef)).orElseThrow().getKeyCipher());
        try {
            check(config.getProvider(),config.getModel(),secret);
            activity.record(config.getProvider(),config.getModel(),"KEY_CHECKED",key.name(),key.masked(),null,actor());
        } catch(AiProviderException failure) {
            tracker.recordFailure(config.getProvider(),config.getModel(),key.fingerprint(),failure);
            activity.record(config.getProvider(),config.getModel(),"KEY_FAILED",key.name(),key.masked(),failure.getCode(),actor());
            throw failure;
        }
    }

    public AiSettingsResponse removeOrMove(Long configId,String keyRef,Integer direction) {
        return changePool(configId,keyRef,direction,null);
    }

    public AiSettingsResponse remove(Long configId,String keyRef,String replacementKeyRef) {
        return changePool(configId,keyRef,null,replacementKeyRef);
    }

    private AiSettingsResponse changePool(Long configId,String keyRef,Integer direction,String replacementKeyRef) {
        return transaction.execute(status -> {
            system.findLockedSingleton().orElseThrow();
            var config=configs.findById(configId).orElseThrow(InvalidAiConfigurationException::new);
            current(config.getProvider(),configId);
            var previous=keys.get(config.getProvider()).keys().stream().filter(key->key.keyRef().equals(keyRef))
                    .findFirst().orElseThrow(InvalidAiConfigurationException::new);
            if ("PRIMARY".equals(keyRef)) {
                if (direction!=null) throw new InvalidAiConfigurationException();
                var next=keys.removePrimary(configId,replacementKeyRef);
                activity.record(config.getProvider(),config.getModel(),"KEY_REMOVED",previous.name(),previous.maskedKey(),null,actor());
                return providers.list().stream().filter(item->next.getId().toString().equals(item.id())).findFirst().orElseThrow();
            }
            if (replacementKeyRef!=null) throw new InvalidAiConfigurationException();
            var draft=new ArrayList<>(backups.findAllByConfigIdOrderByPriorityAsc(configId).stream()
                    .map(key->new AiBackupKeyRequest(key.getId(),key.getName(),null)).toList());
            int index=-1;
            for(int i=0;i<draft.size();i++) if(draft.get(i).id().toString().equals(keyRef)) index=i;
            if(index<0) throw new InvalidAiConfigurationException();
            if(direction==null) draft.remove(index);
            else {
                if(Math.abs(direction)!=1||index+direction<0||index+direction>=draft.size()) throw new InvalidAiConfigurationException();
                Collections.swap(draft,index,index+direction);
            }
            var saved=providers.save(new AiSettingsRequest(config.getProvider(),config.getModel(),null,null,false,draft,configId));
            var next=configs.findById(Long.valueOf(saved.id())).orElseThrow();
            if(config.isTested()) next.markTested();
            var activePool = configs.findAllByActiveTrue().stream()
                    .filter(item -> item.getProvider().equals(config.getProvider())).toList();
            if (config.isActive() || direction == null && !activePool.isEmpty()) {
                if (next.isTested()) providers.activate(config.getProvider(),next.getId());
                else {
                    activePool.forEach(item -> item.setActive(false));
                    configs.flush();
                }
            }
            activity.record(config.getProvider(),config.getModel(),direction==null?"KEY_REMOVED":"PRIORITY_CHANGED",
                    previous.name(),previous.maskedKey(),null,actor());
            return providers.list().stream().filter(item->saved.id().equals(item.id())).findFirst().orElseThrow();
        });
    }

    private void check(String provider,String model,String secret) {
        if (dailyQuota != null) dailyQuota.recordRequest(provider, model, secret);
        String answer;
        if(client instanceof UsageAwareChatProviderClient usageClient) {
            var reply=usageClient.chatWithUsage(provider,model,secret,"Reply with OK.");
            if(reply==null) throw new AiProviderException();
            tracker.observeLimit(provider,AiQuotaTracker.fingerprint(secret),model,reply.tokensPerMinute());
            if (dailyQuota != null) dailyQuota.observeLimit(provider, model, secret, reply.requestsPerDay());
            answer=reply.text();
        } else answer=client.chat(provider,model,secret,"Reply with OK.");
        if(answer==null||answer.isBlank()) throw new AiProviderException();
        tracker.recordSuccess(provider,model,AiQuotaTracker.fingerprint(secret),false);
    }

    private AiProviderConfig current(String provider,Long configId) {
        var current=configs.findFirstByProviderOrderByIdDesc(provider).orElse(null);
        if(!Objects.equals(configId,current==null?null:current.getId())) throw new InvalidAiConfigurationException();
        return current;
    }
    private static void requireValid(EditRequest input) {
        if(!AiProviders.isChatProvider(input.provider())||input.model()==null||input.model().isBlank()||input.model().trim().length()>255
                ||input.name()==null||input.name().isBlank()||input.name().trim().length()>80
                ||(input.apiKey()!=null&&input.apiKey().length()>2048)) throw new InvalidAiConfigurationException();
        AiQuotaSettingsService.normalize(input.projectName());
        AiQuotaSettingsService.validateLimit(input.tpmLimit());
        AiDailyQuotaService.validate(input.dailyRequestLimit());
        if (Boolean.FALSE.equals(input.useDefaultDaily()) && input.dailyRequestLimit()==null)
            throw new InvalidAiConfigurationException();
        if (!input.useDefault() && input.tpmLimit()==null) throw new InvalidAiConfigurationException();
    }
    private static String actor() {
        var authentication=SecurityContextHolder.getContext().getAuthentication();
        return authentication==null?"SYSTEM":authentication.getName();
    }
    private static String mask(String secret) { return secret.length()>=8?"••••"+secret.substring(secret.length()-4):"••••••••"; }
}
