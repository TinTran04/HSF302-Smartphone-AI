package com.smartphoneai.ai;

import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.service.AiModelDirectory.ListedModel;
import com.smartphoneai.service.AiModelDirectory.RateLimits;
import com.smartphoneai.service.impl.HttpAiModelDirectory;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class HttpAiModelDirectoryTest {
    private HttpServer server;
    private final Map<String, String> seenHeaders = new ConcurrentHashMap<>();

    @BeforeEach void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1beta/models", exchange -> {
            seenHeaders.put("gemini", String.valueOf(exchange.getRequestHeaders().getFirst("x-goog-api-key")));
            if (!exchange.getRequestURI().getQuery().contains("pageToken")) {
                reply(exchange, 200, Map.of(), """
                        {"models":[
                          {"name":"models/gemini-3.6-flash","displayName":"Gemini 3.6 Flash","supportedGenerationMethods":["generateContent","countTokens"]},
                          {"name":"models/gemini-embedding-001","displayName":"Embedding","supportedGenerationMethods":["embedContent"]},
                          {"name":"models/gemini-3.6-flash-image","displayName":"Image","supportedGenerationMethods":["generateContent"]},
                          {"name":"models/gemma-3-27b-it","displayName":"Gemma","supportedGenerationMethods":["generateContent"]}
                        ],"nextPageToken":"page-2"}""");
            } else {
                reply(exchange, 200, Map.of(), """
                        {"models":[{"name":"models/gemini-3.5-pro","displayName":"Gemini 3.5 Pro","supportedGenerationMethods":["generateContent"]}]}""");
            }
        });
        server.createContext("/groq/v1/models", exchange -> {
            seenHeaders.put("groq", exchange.getRequestHeaders().getFirst("Authorization"));
            reply(exchange, 200, Map.of(), """
                    {"object":"list","data":[
                      {"id":"llama-3.3-70b-versatile","active":true},
                      {"id":"whisper-large-v3","active":true},
                      {"id":"meta-llama/llama-guard-4-12b","active":true},
                      {"id":"old-model","active":false},
                      {"id":"openai/gpt-oss-120b","active":true}
                    ]}""");
        });
        server.createContext("/groq/v1/chat/completions", exchange -> {
            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            if (exchange.getRequestHeaders().getFirst("Authorization").contains("bad")) {
                reply(exchange, 401, Map.of(), "{\"error\":{\"message\":\"Invalid API Key\"}}");
            } else if (body.contains("terms-model")) {
                reply(exchange, 400, Map.of(), "{\"error\":{\"message\":\"terms acceptance required\"}}");
            } else {
                assertTrue(body.contains("\"max_tokens\":1"));
                reply(exchange, 200, Map.of("x-ratelimit-limit-requests", "14400", "x-ratelimit-limit-tokens", "6000"),
                        "{\"choices\":[{\"message\":{\"content\":\"p\"}}]}");
            }
        });
        server.createContext("/deepseek/models", exchange -> reply(exchange, 200, Map.of(),
                "{\"object\":\"list\",\"data\":[{\"id\":\"deepseek-chat\"},{\"id\":\"deepseek-reasoner\"}]}"));
        server.start();
    }

    @AfterEach void stop() { server.stop(0); }

    private HttpAiModelDirectory directory() {
        String base = "http://127.0.0.1:" + server.getAddress().getPort();
        return new HttpAiModelDirectory(provider -> switch (provider) {
            case "GEMINI" -> base;
            case "GROQ" -> base + "/groq";
            default -> base + "/deepseek";
        });
    }

    private static void reply(HttpExchange exchange, int status, Map<String, String> headers, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        headers.forEach((name, value) -> exchange.getResponseHeaders().add(name, value));
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
        exchange.close();
    }

    @Test void geminiListsOnlyChatModelsAcrossPagesWithKeyInHeader() {
        var models = directory().listChatModels("GEMINI", "gemini-key");
        assertEquals(List.of("gemini-3.6-flash", "gemini-3.5-pro"), models.stream().map(ListedModel::id).toList());
        assertEquals("Gemini 3.6 Flash", models.getFirst().displayName());
        assertEquals("gemini-key", seenHeaders.get("gemini"));
    }

    @Test void groqSkipsSpeechGuardAndInactiveModels() {
        var models = directory().listChatModels("GROQ", "gsk-key");
        assertEquals(List.of("llama-3.3-70b-versatile", "openai/gpt-oss-120b"), models.stream().map(ListedModel::id).toList());
        assertEquals("Bearer gsk-key", seenHeaders.get("groq"));
    }

    @Test void deepSeekListsAvailableModels() {
        assertEquals(List.of("deepseek-chat", "deepseek-reasoner"),
                directory().listChatModels("DEEPSEEK", "sk-key").stream().map(ListedModel::id).toList());
    }

    @Test void groqProbeReadsAccountLimitsFromHeaders() {
        assertEquals(Optional.of(new RateLimits(14_400L, 6_000L)),
                directory().probeLimits("GROQ", "llama-3.3-70b-versatile", "gsk-key"));
        assertEquals(Optional.empty(), directory().probeLimits("GROQ", "terms-model", "gsk-key"));
        assertEquals(Optional.empty(), directory().probeLimits("GEMINI", "gemini-3.6-flash", "gemini-key"));
    }

    @Test void invalidKeyIsReportedAsKeyFailure() {
        var error = assertThrows(AiProviderException.class,
                () -> directory().probeLimits("GROQ", "llama-3.3-70b-versatile", "bad-key"));
        assertEquals("AI_PROVIDER_AUTH_ERROR", error.getCode());
    }

    @Test void unreachableProviderBecomesProviderError() {
        int port = server.getAddress().getPort();
        server.stop(0);
        var offline = new HttpAiModelDirectory(provider -> "http://127.0.0.1:" + port);
        assertThrows(AiProviderException.class, () -> offline.listChatModels("DEEPSEEK", "sk-key"));
    }
}
