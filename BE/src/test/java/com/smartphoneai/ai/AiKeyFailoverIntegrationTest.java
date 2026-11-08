package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.support.ConfigSecretCipher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:aifailover;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=failoveradmin@example.com", "app.root-admin.password=TestPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AiKeyFailoverIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AiProviderService ai;
    @Autowired AiProviderConfigRepository configs;
    @Autowired ConfigSecretCipher cipher;
    @MockitoBean ChatProviderClient provider;
    private JwtTestClient session;

    @BeforeEach void setup() throws Exception {
        configs.deleteAll();
        when(provider.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"failoveradmin@example.com\",\"password\":\"TestPassword123!\"}"))
                .andExpect(status().isOk());
    }

    @Test void backupIsEncryptedMaskedAndTestedBeforeActivation() throws Exception {
        saveWithBackup();
        var config = configs.findFirstByProviderOrderByIdDesc("GEMINI").orElseThrow();
        assertFalse(config.getBackupKeyCipher().contains("backup-secret"));
        assertEquals("backup-secret", cipher.decrypt("GEMINI", config.getBackupKeyCipher()));
        activate().andExpect(status().isConflict());
        testConnection().andExpect(status().isOk());
        var calls = inOrder(provider);
        calls.verify(provider).chat("GEMINI", "demo-model", "primary-secret", "Reply with OK.");
        calls.verify(provider).chat("GEMINI", "demo-model", "backup-secret", "Reply with OK.");
        activate().andExpect(status().isOk());
        mvc.perform(get("/api/admin/ai-settings").with(session))
                .andExpect(jsonPath("$[0].maskedBackupKey").value("••••••••"))
                .andExpect(content().string(not(containsString("backup-secret"))))
                .andExpect(content().string(not(containsString("primary-secret"))));
    }

    @Test void quotaFailureUsesBackupOnceWithTheSamePrompt() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question"))
                .thenThrow(new AiProviderException(429));
        when(provider.chat("GEMINI", "demo-model", "backup-secret", "question"))
                .thenReturn("Câu trả lời từ key dự phòng");

        assertEquals("Câu trả lời từ key dự phòng", ai.chat("question"));
        var calls = inOrder(provider);
        calls.verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        calls.verify(provider).chat("GEMINI", "demo-model", "backup-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void successfulPrimaryReplyDoesNotCallBackup() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question"))
                .thenReturn("Câu trả lời từ key chính");

        assertEquals("Câu trả lời từ key chính", ai.chat("question"));
        verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @ParameterizedTest
    @ValueSource(ints = {401, 403, 404, 502, 504})
    void otherProviderErrorsAreReturnedImmediately(int status) throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        var failure = new AiProviderException(status);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question")).thenThrow(failure);

        assertSame(failure, assertThrows(AiProviderException.class, () -> ai.chat("question")));
        verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void temporaryOverloadRetriesOnceWithoutUsingBackup() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question"))
                .thenThrow(new AiProviderException(503)).thenReturn("Recovered answer");
        assertEquals("Recovered answer", ai.chat("question"));
        verify(provider, times(2)).chat("GEMINI", "demo-model", "primary-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void persistentOverloadStopsAfterSecondAttempt() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        var failure = new AiProviderException(503);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question")).thenThrow(failure);
        assertSame(failure, assertThrows(AiProviderException.class, () -> ai.chat("question")));
        verify(provider, times(2)).chat("GEMINI", "demo-model", "primary-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void backupOverloadCanRecoverAfterPrimaryQuotaFailure() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question"))
                .thenThrow(new AiProviderException(429));
        when(provider.chat("GEMINI", "demo-model", "backup-secret", "question"))
                .thenThrow(new AiProviderException(503)).thenReturn("Backup recovered");
        assertEquals("Backup recovered", ai.chat("question"));
        verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        verify(provider, times(2)).chat("GEMINI", "demo-model", "backup-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void connectionTestRecoversBeforeAllowingActivation() throws Exception {
        saveWithBackup();
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "Reply with OK."))
                .thenThrow(new AiProviderException(503)).thenReturn("OK");
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        assertTrue(configs.findAllByActiveTrue().getFirst().isTested());
        verify(provider, times(2)).chat("GEMINI", "demo-model", "primary-secret", "Reply with OK.");
    }

    @Test void primaryOverloadThenQuotaStillAllowsBackupRetry() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "question"))
                .thenThrow(new AiProviderException(503)).thenThrow(new AiProviderException(429));
        when(provider.chat("GEMINI", "demo-model", "backup-secret", "question"))
                .thenThrow(new AiProviderException(503)).thenReturn("Recovered with backup");
        assertEquals("Recovered with backup", ai.chat("question"));
        var calls = inOrder(provider);
        calls.verify(provider, times(2)).chat("GEMINI", "demo-model", "primary-secret", "question");
        calls.verify(provider, times(2)).chat("GEMINI", "demo-model", "backup-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void failedConnectionRetryDoesNotAllowActivation() throws Exception {
        saveWithBackup();
        when(provider.chat("GEMINI", "demo-model", "primary-secret", "Reply with OK."))
                .thenThrow(new AiProviderException(503));
        testConnection().andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("AI_PROVIDER_BUSY"));
        activate().andExpect(status().isConflict());
        verify(provider, times(2)).chat("GEMINI", "demo-model", "primary-secret", "Reply with OK.");
        verify(provider, never()).chat(eq("GEMINI"), anyString(), eq("backup-secret"), anyString());
    }

    @Test void secondQuotaFailureEndsWithoutRetryingEitherKey() throws Exception {
        saveWithBackup();
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat(anyString(), anyString(), anyString(), eq("question")))
                .thenThrow(new AiProviderException(429));

        assertEquals("AI_PROVIDER_RATE_LIMIT", assertThrows(AiProviderException.class,
                () -> ai.chat("question")).getCode());
        verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        verify(provider).chat("GEMINI", "demo-model", "backup-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void primaryAtQuotaCanBeActivatedAfterBackupPasses() throws Exception {
        saveWithBackup();
        when(provider.chat(eq("GEMINI"), anyString(), eq("primary-secret"), anyString()))
                .thenThrow(new AiProviderException(429));
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        assertEquals("OK", ai.chat("question"));
    }

    @Test void failedBackupTestKeepsExistingActiveConfiguration() throws Exception {
        save(Map.of("provider", "GEMINI", "model", "old-model", "apiKey", "old-secret"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"provider\":\"GEMINI\",\"model\":\"old-model\"}"))
                .andExpect(status().isOk());
        activate().andExpect(status().isOk());
        saveWithBackup();
        when(provider.chat(eq("GEMINI"), anyString(), eq("backup-secret"), anyString()))
                .thenThrow(new AiProviderException(401));
        testConnection().andExpect(status().isServiceUnavailable());
        activate().andExpect(status().isConflict());
        assertEquals("old-model", configs.findAllByActiveTrue().getFirst().getModel());
    }

    @Test void blankFieldsRetainKeysAndExplicitRemovalDisablesFallback() throws Exception {
        saveWithBackup();
        save(Map.of("provider", "GEMINI", "model", "demo-model"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.maskedBackupKey").value("••••••••"));
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        save(Map.of("provider", "GEMINI", "model", "demo-model", "removeBackupKey", true))
                .andExpect(status().isOk()).andExpect(jsonPath("$.maskedBackupKey").value(""));
        testConnection().andExpect(status().isOk());
        activate().andExpect(status().isOk());
        clearInvocations(provider);
        when(provider.chat(anyString(), anyString(), anyString(), eq("question")))
                .thenThrow(new AiProviderException(429));
        assertThrows(AiProviderException.class, () -> ai.chat("question"));
        verify(provider).chat("GEMINI", "demo-model", "primary-secret", "question");
        verifyNoMoreInteractions(provider);
    }

    @Test void duplicateKeysAreRejectedWithoutSavingAnotherConfiguration() throws Exception {
        saveWithBackup();
        long count = configs.count();
        save(Map.of("provider", "GEMINI", "model", "demo-model", "backupApiKey", "primary-secret"))
                .andExpect(status().isConflict());
        save(Map.of("provider", "GEMINI", "model", "demo-model", "backupApiKey", "new-secret", "removeBackupKey", true))
                .andExpect(status().isConflict());
        assertEquals(count, configs.count());
    }

    private void saveWithBackup() throws Exception {
        save(Map.of("provider", "GEMINI", "model", "demo-model", "apiKey", "primary-secret",
                "backupApiKey", "backup-secret")).andExpect(status().isOk())
                .andExpect(jsonPath("$.maskedBackupKey").value("••••••••"));
    }

    private org.springframework.test.web.servlet.ResultActions save(Map<String, Object> input) throws Exception {
        return mvc.perform(put("/api/admin/ai-settings").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(input)));
    }

    private org.springframework.test.web.servlet.ResultActions testConnection() throws Exception {
        return mvc.perform(post("/api/admin/ai-settings/test").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"provider\":\"GEMINI\",\"model\":\"demo-model\"}"));
    }

    private org.springframework.test.web.servlet.ResultActions activate() throws Exception {
        return mvc.perform(post("/api/admin/ai-settings/activate").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"provider\":\"GEMINI\"}"));
    }
}
