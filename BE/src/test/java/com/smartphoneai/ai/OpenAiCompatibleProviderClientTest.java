package com.smartphoneai.ai;

import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.service.impl.SpringAiProviderClient;
import com.smartphoneai.service.support.AiProviders;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;

class OpenAiCompatibleProviderClientTest {
    private HttpServer server;
    private final AtomicReference<String> path = new AtomicReference<>();
    private final AtomicReference<String> authorization = new AtomicReference<>();
    private final AtomicReference<String> requestBody = new AtomicReference<>();
    private volatile int status = 200;
    private volatile String responseBody = """
            {"id":"chatcmpl-1","object":"chat.completion","created":1,"model":"demo",
             "choices":[{"index":0,"message":{"role":"assistant","content":"Xin chào"},"finish_reason":"stop"}],
             "usage":{"prompt_tokens":12,"completion_tokens":3,"total_tokens":15}}
            """;

    @BeforeEach void start() throws Exception {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            path.set(exchange.getRequestURI().getPath());
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.getResponseHeaders().add("x-ratelimit-limit-tokens", "500000");
            exchange.getResponseHeaders().add("x-ratelimit-limit-requests", "1000");
            exchange.getResponseHeaders().add("Retry-After", "17");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
    }

    @AfterEach void stop() { server.stop(0); }

    private SpringAiProviderClient client() {
        return new SpringAiProviderClient(provider -> "http://127.0.0.1:" + server.getAddress().getPort());
    }

    @ParameterizedTest
    @ValueSource(strings = {"GROQ", "DEEPSEEK"})
    void openAiCompatiblePlatformsSendBearerKeyAndReadAnswer(String provider) {
        var reply = client().chatWithUsage(provider, "demo-model", "secret-key", "Câu hỏi");
        assertEquals("Xin chào", reply.text());
        assertEquals(12, reply.inputTokens());
        assertEquals(15, reply.totalTokens());
        assertEquals(500000L, reply.tokensPerMinute());
        assertEquals(1000L, reply.requestsPerDay());
        assertEquals("/v1/chat/completions", path.get());
        assertEquals("Bearer secret-key", authorization.get());
        assertTrue(requestBody.get().contains("\"model\":\"demo-model\""));
        assertTrue(requestBody.get().contains("Câu hỏi"));
    }

    @Test void invalidKeyBecomesKeyFailureSoBackupKeysAreTried() {
        status = 401;
        responseBody = "{\"error\":{\"message\":\"Invalid API Key\",\"code\":\"invalid_api_key\"}}";
        var error = assertThrows(AiProviderException.class,
                () -> client().chat("GROQ", "demo-model", "bad-key", "question"));
        assertTrue(error.isKeyFailure());
        assertEquals("AI_PROVIDER_AUTH_ERROR", error.getCode());
    }

    @Test void rateLimitAndInsufficientBalanceAreQuotaFailures() {
        status = 429;
        responseBody = "{\"error\":{\"message\":\"Rate limit reached\"}}";
        assertTrue(assertThrows(AiProviderException.class,
                () -> client().chat("GROQ", "demo-model", "key", "question")).isQuotaExceeded());
        status = 402;
        responseBody = "{\"error\":{\"message\":\"Insufficient Balance\"}}";
        assertTrue(assertThrows(AiProviderException.class,
                () -> client().chat("DEEPSEEK", "demo-model", "key", "question")).isQuotaExceeded());
    }

    @Test void preservesProviderRetryHeaderAndBalanceClassification() {
        status=429;
        var rate=assertThrows(AiProviderException.class,()->client().chat("GROQ","model","key","question"));
        assertEquals(17L,rate.getRetryAfterSeconds());
        status=402;
        assertTrue(assertThrows(AiProviderException.class,()->client().chat("DEEPSEEK","model","key","question")).isBalanceFailure());
    }

    @Test void unknownModelMapsToModelError() {
        status = 404;
        responseBody = "{\"error\":{\"message\":\"The model does not exist\"}}";
        assertEquals("AI_PROVIDER_MODEL_ERROR", assertThrows(AiProviderException.class,
                () -> client().chat("DEEPSEEK", "missing", "key", "question")).getCode());
    }

    @Test void productionBaseUrlsPointToOfficialOpenAiCompatibleEndpoints() {
        assertEquals("https://api.groq.com/openai", AiProviders.openAiCompatibleBaseUrl("GROQ"));
        assertEquals("https://api.deepseek.com", AiProviders.openAiCompatibleBaseUrl("DEEPSEEK"));
        assertNull(AiProviders.openAiCompatibleBaseUrl("GEMINI"));
    }
}
