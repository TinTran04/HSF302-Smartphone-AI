package com.smartphoneai.service.impl;

import com.smartphoneai.service.ChatProviderClient;

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
import com.google.genai.types.HttpRetryOptions;
import org.springframework.retry.support.RetryTemplate;

@Component
public class SpringAiProviderClient implements ChatProviderClient {
    @Override public String chat(String provider, String model, String apiKey, String prompt) {
        try {
            if ("OPENAI".equals(provider)) {
                var factory = new SimpleClientHttpRequestFactory();
                factory.setConnectTimeout(Duration.ofSeconds(5));
                factory.setReadTimeout(Duration.ofSeconds(25));
                var api = OpenAiApi.builder().apiKey(apiKey)
                        .responseErrorHandler(new org.springframework.web.client.DefaultResponseErrorHandler())
                        .restClientBuilder(RestClient.builder().requestFactory(factory)).build();
                var client = OpenAiChatModel.builder().openAiApi(api)
                        .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                        .defaultOptions(OpenAiChatOptions.builder().model(model).build()).build();
                return client.call(prompt);
            }
            if ("GEMINI".equals(provider)) {
                var google = Client.builder().apiKey(apiKey).httpOptions(HttpOptions.builder().timeout(25000)
                        .retryOptions(HttpRetryOptions.builder().attempts(1).build()).build()).build();
                var client = GoogleGenAiChatModel.builder().genAiClient(google)
                        .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                        .defaultOptions(GoogleGenAiChatOptions.builder().model(model).build()).build();
                try { return client.call(prompt); } finally { client.destroy(); }
            }
            throw new AiProviderException();
        } catch (Exception exception) {
            for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
                if (cause instanceof com.google.genai.errors.ApiException googleError)
                    throw new AiProviderException(googleError.code());
                if (cause instanceof org.springframework.web.client.HttpStatusCodeException httpError)
                    throw new AiProviderException(httpError.getStatusCode().value());
            }
            throw new AiProviderException();
        }
    }
}
