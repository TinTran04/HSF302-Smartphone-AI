package com.smartphoneai.service;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import com.smartphoneai.exception.AiProviderException;
import org.springframework.ai.document.MetadataMode;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.google.genai.GoogleGenAiEmbeddingConnectionDetails;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.time.Duration;

@Component
public class EmbeddingModelFactory {
    public EmbeddingModel create(String provider,String model,String key,int dimensions,boolean query) {
        try {
            if ("OPENAI".equals(provider)) {
                var factory=new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(Duration.ofSeconds(5)); factory.setReadTimeout(Duration.ofSeconds(25));
                var api=OpenAiApi.builder().apiKey(key).restClientBuilder(RestClient.builder().requestFactory(factory)).build();
                return new OpenAiEmbeddingModel(api,MetadataMode.NONE,OpenAiEmbeddingOptions.builder().model(model).dimensions(dimensions).build());
            }
            if ("GEMINI".equals(provider)) {
                var client=Client.builder().apiKey(key).httpOptions(HttpOptions.builder().timeout(25000).build()).build();
                var details=GoogleGenAiEmbeddingConnectionDetails.builder().genAiClient(client).build();
                var type=query ? GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_QUERY : GoogleGenAiTextEmbeddingOptions.TaskType.RETRIEVAL_DOCUMENT;
                var options=GoogleGenAiTextEmbeddingOptions.builder().model(model).dimensions(dimensions).taskType(type).build();
                return new GoogleGenAiTextEmbeddingModel(details,options);
            }
        } catch (Exception ex) { throw new AiProviderException(); }
        throw new AiProviderException();
    }
}
