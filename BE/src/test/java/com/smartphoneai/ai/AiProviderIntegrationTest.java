package com.smartphoneai.ai;

import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.service.AiProviderService;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import static org.junit.jupiter.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import java.time.Duration;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.ArrayList;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:aiprovider;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=aiadmin@example.com", "app.root-admin.password=TestRootPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AiProviderIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired AiProviderConfigRepository configs;
    @Autowired AiProviderService ai;
    @Autowired PlatformTransactionManager transactions;
    @Autowired org.springframework.context.ApplicationContext context;
    @Autowired com.smartphoneai.repository.UserAccountRepository users;
    @Autowired com.smartphoneai.service.AuthTokenService tokens;
    @MockitoBean OtpSender otpSender;
    @MockitoBean ChatProviderClient provider;
    @MockitoBean com.smartphoneai.service.AiModelDirectory modelDirectory;
    @BeforeEach void clearConfigurations() { configs.deleteAll(); }

    @Test void geminiCallDoesNotRunInsideADatabaseTransaction() throws Exception {
        configureKeys(false);
        when(provider.chat(anyString(),anyString(),anyString(),anyString())).thenAnswer(invocation -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return "OK";
        });
        assertEquals("OK",ai.chat("question"));
    }

    @Test void concurrentChatsReserveQuotaAndCallProviderOutsideDatabaseTransactions() throws Exception {
        assertNotSame(context.getBean("applicationTaskExecutor"), context.getBean("aiKeyAlertExecutor"));
        configureKeys(true);
        when(provider.chat(anyString(),anyString(),anyString(),anyString())).thenAnswer(call -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return "OK";
        });
        var ready = new CyclicBarrier(10);
        try (var executor = Executors.newFixedThreadPool(10)) {
            var answers = new ArrayList<Future<String>>();
            for (int i = 0; i < 10; i++) {
                answers.add(executor.submit(() -> {
                    try { ready.await(5, TimeUnit.SECONDS); }
                    catch (Exception error) { throw new IllegalStateException(error); }
                    return ai.chat("question");
                }));
            }
            for (var answer : answers) assertEquals("OK", answer.get(5, TimeUnit.SECONDS));
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {401, 403, 429})
    void keyFailureUsesBackupAndPublishesSafePersistentAdminAlert(int status) throws Exception {
        configureKeys(true);
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString()))
                .thenThrow(new AiProviderException(status));
        assertEquals("OK", ai.chat("private customer prompt"));
        var admin = adminSession();
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin)).andExpect(status().isOk())
                .andExpect(jsonPath("$.alert.status").value("USING_BACKUP"))
                .andExpect(jsonPath("$.alert.reason").value(status == 429 ? "AI_PROVIDER_RATE_LIMIT" : "AI_PROVIDER_AUTH_ERROR"))
                .andExpect(jsonPath("$.alert.detectedAt").exists())
                .andExpect(content().string(not(containsString("primary-private"))))
                .andExpect(content().string(not(containsString("backup-private"))))
                .andExpect(content().string(not(containsString("private customer prompt")))));
        String firstAlert = mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin))
                .andReturn().getResponse().getContentAsString();
        ai.chat("another question");
        mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin))
                .andExpect(content().json(firstAlert));
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString())).thenReturn("recovered");
        ai.test(new AiSettingsRequest("GEMINI", "alert-model", null, null, false));
        assertEquals("recovered", ai.chat("question"));
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin))
                .andExpect(jsonPath("$.alert").isEmpty()));
    }

    @Test void backupFailureAlertSurvivesChatTransactionRollback() throws Exception {
        configureKeys(true);
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString()))
                .thenThrow(new AiProviderException(401));
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("backup-private"), anyString()))
                .thenThrow(new AiProviderException(429));
        assertThrows(AiProviderException.class, () -> new TransactionTemplate(transactions).execute(tx -> ai.chat("question")));
        var admin = adminSession();
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.alert.status").value("BACKUP_FAILED"))
                .andExpect(jsonPath("$.alert.reason").value("AI_PROVIDER_AUTH_ERROR"))
                .andExpect(jsonPath("$.alert.backupFailureReason").value("AI_PROVIDER_RATE_LIMIT")));
    }

    @Test void missingBackupWarnsAdminAndPendingSettingsDoNotHideActiveKeyFailure() throws Exception {
        configureKeys(false);
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString()))
                .thenThrow(new AiProviderException(429));
        assertThrows(AiProviderException.class, () -> ai.chat("question"));
        ai.save(new AiSettingsRequest("GEMINI", "pending-model", "new-private-key", null, false));
        var admin = adminSession();
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin))
                .andExpect(status().isOk()).andExpect(jsonPath("$.alert.status").value("MISSING_BACKUP"))
                .andExpect(jsonPath("$.alert.model").value("alert-model")));
        when(provider.chat(eq("GEMINI"), eq("pending-model"), anyString(), anyString())).thenReturn("OK");
        ai.test(new AiSettingsRequest("GEMINI", "pending-model", null, null, false));
        ai.activate("GEMINI");
        mvc.perform(get("/api/admin/ai-settings/key-alert").with(admin)).andExpect(jsonPath("$.alert").isEmpty());
    }

    @Test void modelPermissionErrorTriesBackupAndMonitoringRequiresAdmin() throws Exception {
        configureKeys(true);
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString()))
                .thenThrow(new AiProviderException(404));
        assertEquals("OK", ai.chat("question"));
        verify(provider).chat(eq("GEMINI"), eq("alert-model"), eq("backup-private"), anyString());
        mvc.perform(get("/api/admin/ai-settings/key-alert").with(adminSession()))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/ai-settings/key-alert")).andExpect(status().isUnauthorized());
        var customer = com.smartphoneai.entity.UserAccount.pendingCustomer(java.util.UUID.randomUUID() + "@example.test",
                "Customer", "0900000000", "unused-test-hash");
        customer.activate();
        customer = users.saveAndFlush(customer);
        mvc.perform(get("/api/admin/ai-settings/key-alert").with(JwtTestClient.authenticated(tokens, customer)))
                .andExpect(status().isForbidden());
    }

    private void configureKeys(boolean backup) {
        when(provider.chat(eq("GEMINI"), eq("alert-model"), anyString(), anyString())).thenReturn("OK");
        ai.save(new AiSettingsRequest("GEMINI", "alert-model", "primary-private", backup ? "backup-private" : null, !backup));
        ai.test(new AiSettingsRequest("GEMINI", "alert-model", null, null, false));
        ai.activate("GEMINI");
        clearInvocations(provider);
    }

    private JwtTestClient adminSession() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        return session;
    }
    @Test void onlySuccessfullyTestedConfigurationCanBeActivatedWithoutReturningSecret() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin@example.com\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        mvc.perform(put("/api/admin/ai-settings").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"demo-model\",\"apiKey\":\"secret-key-123\"}"))
                .andExpect(status().isOk()).andExpect(content().string(not(containsString("secret-key-123"))));
        org.junit.jupiter.api.Assertions.assertFalse(configs.findFirstByProviderOrderByIdDesc("GEMINI").orElseThrow().getKeyCipher().contains("secret-key-123"));
        mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\"}")).andExpect(status().isConflict());
        when(provider.chat(eq("GEMINI"), eq("demo-model"), eq("secret-key-123"), anyString())).thenReturn("OK");
        mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"demo-model\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/admin/ai-settings").with(session)).andExpect(status().isOk())
                .andExpect(content().string(not(containsString("secret-key-123"))));
        mvc.perform(put("/api/admin/ai-settings").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"bad-model\",\"apiKey\":\"bad-key\"}"))
                .andExpect(status().isOk());
        when(provider.chat(eq("GEMINI"), eq("bad-model"), eq("bad-key"), anyString())).thenThrow(new AiProviderException(503));
        mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"bad-model\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AI_PROVIDER_BUSY"))
                .andExpect(jsonPath("$.message").value(containsString("quá tải")));
        mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\"}")).andExpect(status().isConflict());
        org.junit.jupiter.api.Assertions.assertEquals("GEMINI", configs.findAllByActiveTrue().getFirst().getProvider());
        org.junit.jupiter.api.Assertions.assertEquals("demo-model", configs.findAllByActiveTrue().getFirst().getModel());
    }
    @Test void openAiRequestsAreRejectedAsInvalidInput() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        long count = configs.count();
        String input = "{\"provider\":\"OPENAI\",\"model\":\"old-model\",\"apiKey\":\"old-secret\"}";
        mvc.perform(put("/api/admin/ai-settings").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(input))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(input))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\"}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        org.junit.jupiter.api.Assertions.assertEquals(count, configs.count());
        verifyNoInteractions(provider);
    }
    @Test void adminCanSwitchActiveChatPlatformBetweenGeminiGroqAndDeepSeek() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        when(provider.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        String[][] platforms = {{"GEMINI", "gemini-model", "gemini-secret"}, {"GROQ", "llama-3.3-70b-versatile", "gsk-secret"},
                {"DEEPSEEK", "deepseek-chat", "sk-deepseek-secret"}};
        for (String[] platform : platforms) {
            String body = "{\"provider\":\"" + platform[0] + "\",\"model\":\"" + platform[1] + "\"";
            mvc.perform(put("/api/admin/ai-settings").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(body + ",\"apiKey\":\"" + platform[2] + "\",\"backupKeys\":[{\"name\":\"Dự phòng\",\"apiKey\":\"" + platform[2] + "-backup\"}]}"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.provider").value(platform[0]))
                    .andExpect(content().string(not(containsString(platform[2]))));
            mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content(body + "}")).andExpect(status().isOk());
            verify(provider).chat(eq(platform[0]), eq(platform[1]), eq(platform[2]), anyString());
            verify(provider).chat(eq(platform[0]), eq(platform[1]), eq(platform[2] + "-backup"), anyString());
        }
        mvc.perform(get("/api/admin/ai-settings").with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$[*].provider", containsInAnyOrder("GEMINI", "GROQ", "DEEPSEEK")));
        for (String[] platform : platforms) {
            mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"provider\":\"" + platform[0] + "\"}")).andExpect(status().isOk())
                    .andExpect(jsonPath("$[?(@.active == true)].provider").value(platform[0]));
            assertEquals(1, configs.findAllByActiveTrue().size());
            assertEquals(platform[0], configs.findAllByActiveTrue().getFirst().getProvider());
            clearInvocations(provider);
            when(provider.chat(eq(platform[0]), eq(platform[1]), eq(platform[2]), anyString())).thenReturn("answer from " + platform[0]);
            assertEquals("answer from " + platform[0], ai.chat("question"));
            verify(provider).chat(eq(platform[0]), eq(platform[1]), eq(platform[2]), anyString());
            verify(provider, times(1)).chat(anyString(), anyString(), anyString(), anyString());
        }
    }
    @Test void adminFetchesTopFreeModelsWithTheSavedKeyWithoutExposingIt() throws Exception {
        mvc.perform(post("/api/admin/ai-settings/models").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GROQ\"}")).andExpect(status().is4xxClientError());
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/admin/ai-settings/models").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GROQ\"}")).andExpect(status().isConflict());
        ai.save(new AiSettingsRequest("GROQ", "llama-3.3-70b-versatile", "gsk-saved-secret", null, false));
        when(modelDirectory.listChatModels("GROQ", "gsk-saved-secret")).thenReturn(java.util.List.of(
                new com.smartphoneai.service.AiModelDirectory.ListedModel("llama-3.1-8b-instant", "llama-3.1-8b-instant"),
                new com.smartphoneai.service.AiModelDirectory.ListedModel("llama-3.3-70b-versatile", "llama-3.3-70b-versatile")));
        when(modelDirectory.probeLimits("GROQ", "llama-3.1-8b-instant", "gsk-saved-secret"))
                .thenReturn(java.util.Optional.of(new com.smartphoneai.service.AiModelDirectory.RateLimits(14_400L, 6_000L)));
        when(modelDirectory.probeLimits("GROQ", "llama-3.3-70b-versatile", "gsk-saved-secret"))
                .thenReturn(java.util.Optional.of(new com.smartphoneai.service.AiModelDirectory.RateLimits(1_000L, 12_000L)));
        mvc.perform(post("/api/admin/ai-settings/models").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GROQ\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("LIVE"))
                .andExpect(jsonPath("$.models[0].id").value("llama-3.1-8b-instant"))
                .andExpect(jsonPath("$.models[0].requestsPerDay").value(14400))
                .andExpect(jsonPath("$.models[1].id").value("llama-3.3-70b-versatile"))
                .andExpect(content().string(not(containsString("gsk-saved-secret"))));
        mvc.perform(post("/api/admin/ai-settings/models").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\",\"apiKey\":\"x\"}"))
                .andExpect(status().isBadRequest());
    }
}
