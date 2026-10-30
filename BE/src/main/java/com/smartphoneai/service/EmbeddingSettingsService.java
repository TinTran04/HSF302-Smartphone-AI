package com.smartphoneai.service;

import com.smartphoneai.dto.request.EmbeddingSettingsRequest;
import com.smartphoneai.entity.EmbeddingConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.EmbeddingConfigRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class EmbeddingSettingsService {
    public record Active(String id,String provider,String model,String key,int dimensions) {}
    private final EmbeddingConfigRepository configs;
    private final KnowledgeDocumentRepository documents;
    private final SystemSettingRepository settings;
    private final ConfigSecretCipher cipher;
    private final EmbeddingModelFactory factory;
    public EmbeddingSettingsService(EmbeddingConfigRepository configs,KnowledgeDocumentRepository documents,
                                    SystemSettingRepository settings,ConfigSecretCipher cipher,EmbeddingModelFactory factory) {
        this.configs=configs; this.documents=documents; this.settings=settings; this.cipher=cipher; this.factory=factory;
    }
    @Transactional(readOnly=true)
    public Map<String,Object> describe() {
        var current=configs.findByActiveTrue().orElse(null);
        var response=new LinkedHashMap<String,Object>(); response.put("configured",current!=null);
        if (current!=null) {
            response.put("provider",current.getProvider()); response.put("model",current.getModel());
            response.put("dimensions",current.getDimensions()); response.put("maskedKey","••••••••");
        }
        response.put("reindexRequired",documents.findAll().stream().anyMatch(d -> d.getEmbeddingVersion()==null));
        return response;
    }
    @Transactional
    public Map<String,Object> configure(EmbeddingSettingsRequest input) {
        var previous=configs.findByActiveTrue().orElse(null);
        String key=input.apiKey();
        boolean reuse=key==null || key.isBlank();
        if (reuse) {
            if (previous==null || !previous.getProvider().equals(input.provider())) throw new InvalidAiConfigurationException();
            key=cipher.decrypt("EMBEDDING:"+previous.getProvider(),previous.getKeyCipher());
        }
        var model=factory.create(input.provider(),input.model().trim(),key,input.dimensions(),false);
        try {
            float[] sample=model.embed("Kiểm tra kết nối embedding");
            if (sample==null || sample.length!=input.dimensions()) throw new AiProviderException();
            for (float value : sample) if (!Float.isFinite(value)) throw new AiProviderException();
        } catch (RuntimeException ex) { throw new AiProviderException(); }
        settings.findLockedSingleton().orElseThrow();
        var current=configs.findByActiveTrue().orElse(null);
        if (reuse && (current==null || previous==null || !current.getId().equals(previous.getId()))) throw new InvalidAiConfigurationException();
        String encrypted=cipher.encrypt("EMBEDDING:"+input.provider(),key);
        boolean compatible=current!=null && current.getProvider().equals(input.provider())
                && current.getModel().equals(input.model().trim()) && current.getDimensions()==input.dimensions();
        if (compatible) current.replaceKey(encrypted);
        else {
            if (current!=null) current.deactivate();
            configs.saveAndFlush(new EmbeddingConfig(input.provider(),input.model().trim(),encrypted,input.dimensions()));
            for (var doc : documents.findAll()) if (doc.getEmbeddingVersion()!=null) doc.fail();
        }
        configs.flush();
        return describe();
    }
    @Transactional(readOnly=true)
    public Active current() {
        var config=configs.findByActiveTrue().orElseThrow(AiProviderException::new);
        return new Active(config.getId().toString(),config.getProvider(),config.getModel(),
                cipher.decrypt("EMBEDDING:"+config.getProvider(),config.getKeyCipher()),config.getDimensions());
    }
}
