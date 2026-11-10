package com.smartphoneai.service.impl;

import com.smartphoneai.service.ChatProviderClient;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Component;
import com.google.genai.types.HttpRetryOptions;
import org.springframework.retry.support.RetryTemplate;

@Component
public class SpringAiProviderClient implements ChatProviderClient {
    @Override public String chat(String provider, String model, String apiKey, String prompt) {
        if (!"GEMINI".equals(provider)) throw new InvalidAiConfigurationException();
        try {
            var google = Client.builder().apiKey(apiKey).httpOptions(HttpOptions.builder().timeout(25000)
                    .retryOptions(HttpRetryOptions.builder().attempts(1).build()).build()).build();
            var client = GoogleGenAiChatModel.builder().genAiClient(google)
                    .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                    .defaultOptions(GoogleGenAiChatOptions.builder().model(model).build()).build();
            try { return client.call(prompt); } finally { client.destroy(); }
        } catch (Exception exception) {
            for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
                if (cause instanceof com.google.genai.errors.ApiException googleError)
                    throw AiProviderException.fromProvider(googleError.code(), googleError.message());
                if (cause instanceof org.springframework.web.client.HttpStatusCodeException httpError)
                    throw AiProviderException.fromProvider(httpError.getStatusCode().value(), httpError.getResponseBodyAsString());
            }
            throw new AiProviderException();
        }
    }
}
