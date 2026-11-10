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
    @BeforeEach void clearConfigurations() { configs.deleteAll(); }

    @Test void concurrentChatsReturnWithoutReservingAnotherDatabaseConnectionForAlerts() throws Exception {
        assertNotSame(context.getBean("applicationTaskExecutor"), context.getBean("aiKeyAlertExecutor"));
        configureKeys(true);
        var ready = new CyclicBarrier(10);
        try (var executor = Executors.newFixedThreadPool(10)) {
            var answers = new ArrayList<Future<String>>();
            for (int i = 0; i < 10; i++) {
                answers.add(executor.submit(() -> new TransactionTemplate(transactions).execute(tx -> {
                    configs.findAllByActiveTrue();
                    try { ready.await(5, TimeUnit.SECONDS); }
                    catch (Exception error) { throw new IllegalStateException(error); }
                    return ai.chat("question");
                })));
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

    @Test void modelErrorDoesNotSwitchKeysAndMonitoringRequiresAdmin() throws Exception {
        configureKeys(true);
        when(provider.chat(eq("GEMINI"), eq("alert-model"), eq("primary-private"), anyString()))
                .thenThrow(new AiProviderException(404));
        assertThrows(AiProviderException.class, () -> ai.chat("question"));
        verify(provider, never()).chat(eq("GEMINI"), eq("alert-model"), eq("backup-private"), anyString());
        mvc.perform(get("/api/admin/ai-settings/key-alert").with(adminSession()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.alert").isEmpty());
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
}
