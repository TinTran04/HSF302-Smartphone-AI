package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.request.AiBackupKeyRequest;
import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.AiKeyAlertService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.support.JwtTestClient;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:multipleaikeys;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=keypool@example.test", "app.root-admin.password=TestPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class MultipleAiBackupKeysIntegrationTest {
    @Autowired AiProviderService ai;
    @Autowired AiProviderConfigRepository configs;
    @Autowired AiBackupKeyRepository backups;
    @Autowired AiKeyAlertService alerts;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean ChatProviderClient provider;
    @MockitoBean OtpSender sender;

    @BeforeEach void reset() {
        backups.deleteAll();
        configs.deleteAll();
        when(provider.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
    }

    @Test void storesNamedEncryptedKeysAndTriesThemInPriorityOrder() throws Exception {
        var saved = savePool();
        assertEquals(List.of("Project A", "Project B", "Project C"), saved.backupKeys().stream().map(k -> k.name()).toList());
        String response = json.writeValueAsString(saved);
        assertFalse(response.contains("backup-private-A001"));
        assertTrue(saved.backupKeys().getFirst().maskedKey().endsWith("A001"));
        assertFalse(backups.findAll().getFirst().getKeyCipher().contains("backup-private"));
        activate(saved);
        clearInvocations(provider);
        when(provider.chat("GEMINI", "pool-model", "primary-private", "question")).thenThrow(new AiProviderException(401));
        when(provider.chat("GEMINI", "pool-model", "backup-private-A001", "question")).thenThrow(new AiProviderException(429));
        when(provider.chat("GEMINI", "pool-model", "backup-private-B002", "question")).thenThrow(new AiProviderException(403));
        assertEquals("OK", ai.chat("question"));
        var order = inOrder(provider);
        order.verify(provider).chat("GEMINI", "pool-model", "primary-private", "question");
        order.verify(provider).chat("GEMINI", "pool-model", "backup-private-A001", "question");
        order.verify(provider).chat("GEMINI", "pool-model", "backup-private-B002", "question");
        order.verify(provider).chat("GEMINI", "pool-model", "backup-private-C003", "question");
        verifyNoMoreInteractions(provider);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            assertEquals("Project C", alerts.current().orElseThrow().backupKeyName());
            var keys = backups.findAllByConfigIdOrderByPriorityAsc(Long.valueOf(saved.id()));
            assertEquals(List.of("KEY_ERROR", "KEY_ERROR", "WORKING"), keys.stream().map(k -> k.getLastStatus()).toList());
        });
    }

    @Test void removesOnlySelectedKeyAndProtectsActiveSnapshotAndConcurrentDraft() {
        var saved = savePool();
        activate(saved);
        var retained = List.of(keep(saved, 2), keep(saved, 0));
        var next = ai.save(new AiSettingsRequest("GEMINI", "pool-model", null, null, false, retained, Long.valueOf(saved.id())));
        assertEquals(List.of("Project C", "Project A"), next.backupKeys().stream().map(k -> k.name()).toList());
        assertEquals(3, backups.findAllByConfigIdOrderByPriorityAsc(Long.valueOf(saved.id())).size());
        assertTrue(configs.findById(Long.valueOf(saved.id())).orElseThrow().isActive());
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(
                new AiSettingsRequest("GEMINI", "pool-model", null, null, false, retained, Long.valueOf(saved.id()))));
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(
                new AiSettingsRequest("GEMINI", "pool-model", null, null, true)));
        assertEquals(2, ai.list().getFirst().backupKeys().size());
    }

    @Test void rejectsDuplicateSecretsNamesAndForeignKeyIdentifiers() {
        var saved = savePool();
        long version = Long.valueOf(saved.id());
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(new AiSettingsRequest("GEMINI", "pool-model", null,
                null, false, List.of(new AiBackupKeyRequest(null, "Main duplicate", "primary-private")), version)));
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(new AiSettingsRequest("GEMINI", "pool-model", null,
                null, false, List.of(new AiBackupKeyRequest(null, "A", "same-private-key"),
                new AiBackupKeyRequest(null, "B", "same-private-key")), version)));
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(new AiSettingsRequest("GEMINI", "pool-model", null,
                null, false, List.of(new AiBackupKeyRequest(null, "A", "different-key-a"),
                new AiBackupKeyRequest(null, " a ", "different-key-b")), version)));
        assertThrows(InvalidAiConfigurationException.class, () -> ai.save(new AiSettingsRequest("GEMINI", "pool-model", null,
                null, false, List.of(new AiBackupKeyRequest(999999L, "Foreign", null)), version)));
        assertEquals(version, Long.valueOf(ai.list().getFirst().id()));
    }

    @Test void activatingAnOlderConfirmedDraftDoesNotActivateAnotherAdminsNewerDraft() {
        var first = savePool();
        activate(first);
        var next = ai.save(new AiSettingsRequest("GEMINI", "new-model", null, null, false,
                List.of(keep(first, 0)), Long.valueOf(first.id())));
        ai.test(new AiSettingsRequest("GEMINI", "new-model", null, null, false, null, Long.valueOf(next.id())));
        assertThrows(InvalidAiConfigurationException.class, () -> ai.activate("GEMINI", Long.valueOf(first.id())));
        assertEquals(Long.valueOf(first.id()), configs.findAllByActiveTrue().getFirst().getId());
    }

    @Test void adminCanTestOneStoredKeyAndAKeyFromAnotherConfigurationIsRejected() throws Exception {
        var saved = savePool();
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"keypool@example.test\",\"password\":\"TestPassword123!\"}"))
                .andExpect(status().isOk());
        clearInvocations(provider);
        mvc.perform(post("/api/admin/ai-settings/" + saved.id() + "/backup-keys/" + saved.backupKeys().get(1).id() + "/test")
                        .with(session).with(csrf())).andExpect(status().isOk());
        verify(provider).chat("GEMINI", "pool-model", "backup-private-B002", "Reply with OK.");
        verifyNoMoreInteractions(provider);
        mvc.perform(post("/api/admin/ai-settings/999999/backup-keys/" + saved.backupKeys().get(1).id() + "/test")
                        .with(session).with(csrf())).andExpect(status().isConflict());
    }

    private AiSettingsResponse savePool() {
        return ai.save(new AiSettingsRequest("GEMINI", "pool-model", "primary-private", null, false, List.of(
                new AiBackupKeyRequest(null, "Project A", "backup-private-A001"),
                new AiBackupKeyRequest(null, "Project B", "backup-private-B002"),
                new AiBackupKeyRequest(null, "Project C", "backup-private-C003")), null));
    }
    private AiBackupKeyRequest keep(AiSettingsResponse saved, int index) {
        var key = saved.backupKeys().get(index);
        return new AiBackupKeyRequest(Long.valueOf(key.id()), key.name(), null);
    }
    private void activate(AiSettingsResponse saved) {
        ai.test(new AiSettingsRequest("GEMINI", saved.model(), null, null, false, null, Long.valueOf(saved.id())));
        ai.activate("GEMINI");
    }
}
