package com.smartphoneai.service;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import com.smartphoneai.exception.AiProviderException;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Component;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import java.time.Duration;

@Component
public class SpringAiProviderClient implements ChatProviderClient {
    @Override public String chat(String provider, String model, String apiKey, String prompt) {
        try {
            if ("OPENAI".equals(provider)) {
                var factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(Duration.ofSeconds(5));
                factory.setReadTimeout(Duration.ofSeconds(25));
                var api = OpenAiApi.builder().apiKey(apiKey)
                        .restClientBuilder(RestClient.builder().requestFactory(factory)).build();
                var client = OpenAiChatModel.builder().openAiApi(api)
                        .defaultOptions(OpenAiChatOptions.builder().model(model).build()).build();
                return client.call(prompt);
            }
            if ("GEMINI".equals(provider)) {
                var google = Client.builder().apiKey(apiKey).httpOptions(HttpOptions.builder().timeout(25000).build()).build();
                var client = GoogleGenAiChatModel.builder().genAiClient(google)
                        .defaultOptions(GoogleGenAiChatOptions.builder().model(model).build()).build();
                try { return client.call(prompt); } finally { client.destroy(); }
            }
            throw new AiProviderException();
        } catch (Exception ex) { throw new AiProviderException(); }
    }
}
