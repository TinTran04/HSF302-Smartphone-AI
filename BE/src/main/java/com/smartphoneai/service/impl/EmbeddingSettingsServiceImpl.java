package com.smartphoneai.service.impl;

import com.smartphoneai.service.support.ConfigSecretCipher;
import com.smartphoneai.service.support.EmbeddingModelFactory;

import com.smartphoneai.service.EmbeddingSettingsService;

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
import java.util.Objects;

@Service
public class EmbeddingSettingsServiceImpl implements EmbeddingSettingsService {
    private static final String DEFAULT_MODEL = "gemini-embedding-001";
    private static final int DEFAULT_DIMENSIONS = 768;
    private final EmbeddingConfigRepository configs;
    private final KnowledgeDocumentRepository documents;
    private final SystemSettingRepository settings;
    private final ConfigSecretCipher cipher;
    private final EmbeddingModelFactory factory;
    public EmbeddingSettingsServiceImpl(EmbeddingConfigRepository configs,KnowledgeDocumentRepository documents,
                                    SystemSettingRepository settings,ConfigSecretCipher cipher,EmbeddingModelFactory factory) {
        this.configs=configs; this.documents=documents; this.settings=settings; this.cipher=cipher; this.factory=factory;
    }
    @Override
    @Transactional(readOnly=true)
    public Map<String,Object> describe() {
        var current=configs.findByActiveTrue().orElse(null);
        boolean configured=current!=null && "GEMINI".equals(current.getProvider());
        var response=new LinkedHashMap<String,Object>(); response.put("configured",configured);
        response.put("provider", "GEMINI");
        response.put("model", configured ? current.getModel() : DEFAULT_MODEL);
        response.put("dimensions", configured ? current.getDimensions() : DEFAULT_DIMENSIONS);
        response.put("maskedKey", configured ? "••••••••" : "");
        var indexedDocuments=documents.findAll();
        response.put("reindexRequired",(!configured && !indexedDocuments.isEmpty())
                || indexedDocuments.stream().anyMatch(d -> d.getEmbeddingVersion()==null));
        return response;
    }
    @Override
    @Transactional
    public Map<String,Object> configure(EmbeddingSettingsRequest input) {
        if (!"GEMINI".equals(input.provider())) throw new InvalidAiConfigurationException();
        var previous=configs.findByActiveTrue().orElse(null);
        boolean previousGemini = previous != null && "GEMINI".equals(previous.getProvider());
        boolean defaultModel = input.model() == null || input.model().isBlank();
        String modelName = defaultModel ? (previousGemini ? previous.getModel() : DEFAULT_MODEL) : input.model().trim();
        int dimensions = input.dimensions() == null
                ? (previousGemini ? previous.getDimensions() : DEFAULT_DIMENSIONS) : input.dimensions();
        String key=input.apiKey();
        boolean reuse=key==null || key.isBlank();
        if (reuse) {
            if (previous==null || !previous.getProvider().equals(input.provider())) throw new InvalidAiConfigurationException();
            key=cipher.decrypt("EMBEDDING:"+previous.getProvider(),previous.getKeyCipher());
        }
        var model=factory.create(input.provider(),modelName,key,dimensions,false);
        try {
            float[] sample=model.embed("Kiểm tra kết nối embedding");
            if (sample==null || sample.length!=dimensions) throw new AiProviderException();
            for (float value : sample) if (!Float.isFinite(value)) throw new AiProviderException();
        } catch (RuntimeException ex) { throw new AiProviderException(); }
        settings.findLockedSingleton().orElseThrow();
        var current=configs.findByActiveTrue().orElse(null);
        if ((reuse || defaultModel || input.dimensions() == null)
                && !Objects.equals(current == null ? null : current.getId(), previous == null ? null : previous.getId())) {
            throw new InvalidAiConfigurationException();
        }
        String encrypted=cipher.encrypt("EMBEDDING:"+input.provider(),key);
        boolean compatible=current!=null && current.getProvider().equals(input.provider())
                && current.getModel().equals(modelName) && current.getDimensions()==dimensions;
        if (compatible) current.replaceKey(encrypted);
        else {
            if (current!=null) current.deactivate();
            configs.saveAndFlush(new EmbeddingConfig(input.provider(),modelName,encrypted,dimensions));
            for (var doc : documents.findAll()) if (doc.getEmbeddingVersion()!=null) doc.fail();
        }
        configs.flush();
        return describe();
    }
    @Override
    @Transactional(readOnly=true)
    public Active current() {
        var config=configs.findByActiveTrue().orElseThrow(AiProviderException::new);
        if (!"GEMINI".equals(config.getProvider())) throw new InvalidAiConfigurationException();
        return new Active(config.getId().toString(),config.getProvider(),config.getModel(),
                cipher.decrypt("EMBEDDING:"+config.getProvider(),config.getKeyCipher()),config.getDimensions());
    }
}
