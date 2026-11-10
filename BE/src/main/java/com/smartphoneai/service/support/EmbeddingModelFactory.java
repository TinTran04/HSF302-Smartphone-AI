package com.smartphoneai.service.support;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.google.genai.GoogleGenAiEmbeddingConnectionDetails;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import org.springframework.stereotype.Component;

@Component
public class EmbeddingModelFactory {
    public EmbeddingModel create(String provider,String model,String key,int dimensions,boolean query) {
        if (!"GEMINI".equals(provider)) throw new InvalidAiConfigurationException();
        try {
            var client=Client.builder().apiKey(key).httpOptions(HttpOptions.builder().timeout(25000).build()).build();
            var details=GoogleGenAiEmbeddingConnectionDetails.builder().genAiClient(client).build();
            var type=query ? GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_QUERY : GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_DOCUMENT;
            var options=GoogleGenAiTextEmbeddingOptions.builder().model(model).dimensions(dimensions).taskType(type).build();
            return new GoogleGenAiTextEmbeddingModel(details,options);
        } catch (Exception ex) { throw new AiProviderException(); }
    }
}
