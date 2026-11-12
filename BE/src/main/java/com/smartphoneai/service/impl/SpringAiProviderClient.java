package com.smartphoneai.service.impl;

import com.smartphoneai.service.UsageAwareChatProviderClient;
import com.smartphoneai.service.support.AiProviders;

import com.google.genai.Client;
import com.google.genai.types.HttpOptions;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.function.Function;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import com.google.genai.types.HttpRetryOptions;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.util.StreamUtils;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestClient;

/**
 * Gọi nền tảng Chat AI đang được chọn.
 * Gemini dùng SDK Google GenAI; Groq và DeepSeek dùng API tương thích OpenAI qua Spring AI.
 */
@Component
public class SpringAiProviderClient implements UsageAwareChatProviderClient {
    private static final int CONNECT_TIMEOUT_MS = 10_000;
    private static final int READ_TIMEOUT_MS = 25_000;
    private final Function<String, String> openAiCompatibleBaseUrls;

    public SpringAiProviderClient() {
        this(AiProviders::openAiCompatibleBaseUrl);
    }

    /** Cho phép kiểm thử trỏ Groq/DeepSeek tới máy chủ giả lập. */
    public SpringAiProviderClient(Function<String, String> openAiCompatibleBaseUrls) {
        this.openAiCompatibleBaseUrls = openAiCompatibleBaseUrls;
    }

    @Override public String chat(String provider, String model, String apiKey, String prompt) {
        return chatWithUsage(provider,model,apiKey,prompt).text();
    }
    @Override public Reply chatWithUsage(String provider, String model, String apiKey, String prompt) {
        if (!AiProviders.isChatProvider(provider)) throw new InvalidAiConfigurationException();
        return AiProviders.GEMINI.equals(provider)
                ? callGemini(model, apiKey, prompt)
                : callOpenAiCompatible(provider, model, apiKey, prompt);
    }

    private Reply callGemini(String model, String apiKey, String prompt) {
        try {
            var google = Client.builder().apiKey(apiKey).httpOptions(HttpOptions.builder().timeout(READ_TIMEOUT_MS)
                    .retryOptions(HttpRetryOptions.builder().attempts(1).build()).build()).build();
            var client = GoogleGenAiChatModel.builder().genAiClient(google)
                    .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                    .defaultOptions(GoogleGenAiChatOptions.builder().model(model).build()).build();
            try {
                return reply(client.call(new Prompt(prompt)));
            } finally { client.destroy(); }
        } catch (Exception exception) {
            throw translate(exception);
        }
    }

    private Reply callOpenAiCompatible(String provider, String model, String apiKey, String prompt) {
        try {
            var requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(CONNECT_TIMEOUT_MS);
            requestFactory.setReadTimeout(READ_TIMEOUT_MS);
            var api = OpenAiApi.builder()
                    .baseUrl(openAiCompatibleBaseUrls.apply(provider))
                    .apiKey(apiKey)
                    .restClientBuilder(RestClient.builder().requestFactory(requestFactory))
                    .responseErrorHandler(new ProviderErrorHandler())
                    .build();
            var client = OpenAiChatModel.builder().openAiApi(api)
                    .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                    .defaultOptions(OpenAiChatOptions.builder().model(model).build()).build();
            return reply(client.call(new Prompt(prompt)));
        } catch (Exception exception) {
            throw translate(exception);
        }
    }

    private static Reply reply(ChatResponse response) {
        if (response == null || response.getResult() == null || response.getResult().getOutput() == null)
            throw new AiProviderException();
        var usage = response.getMetadata() == null ? null : response.getMetadata().getUsage();
        return new Reply(response.getResult().getOutput().getText(), usage == null ? null : usage.getPromptTokens());
    }

    private static AiProviderException translate(Exception exception) {
        for (Throwable cause = exception; cause != null; cause = cause.getCause()) {
            if (cause instanceof AiProviderException providerError) return providerError;
            if (cause instanceof com.google.genai.errors.ApiException googleError)
                return AiProviderException.fromProvider(googleError.code(), googleError.message());
            if (cause instanceof org.springframework.web.client.HttpStatusCodeException httpError)
                return AiProviderException.fromProvider(httpError.getStatusCode().value(), httpError.getResponseBodyAsString());
        }
        return new AiProviderException();
    }

    /** Đổi lỗi HTTP của Groq/DeepSeek thành {@link AiProviderException} để giữ nguyên luồng key dự phòng. */
    static final class ProviderErrorHandler implements ResponseErrorHandler {
        @Override public boolean hasError(ClientHttpResponse response) throws IOException {
            return response.getStatusCode().isError();
        }
        @Override public void handleError(URI url, HttpMethod method, ClientHttpResponse response) throws IOException {
            handleError(response);
        }
        @Override public void handleError(ClientHttpResponse response) throws IOException {
            String body;
            try { body = StreamUtils.copyToString(response.getBody(), StandardCharsets.UTF_8); }
            catch (IOException ignored) { body = ""; }
            throw AiProviderException.fromProvider(response.getStatusCode().value(), body);
        }
    }
}
