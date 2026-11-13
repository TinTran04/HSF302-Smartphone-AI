package com.smartphoneai.ai;

import com.smartphoneai.dto.request.AiBackupKeyRequest;
import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.service.impl.AiKeyManagementService;
import com.smartphoneai.service.impl.AiQuotaSettingsService;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:aikeymanagement;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
class AiKeyManagementIntegrationTest {
    @Autowired AiProviderService providers;
    @Autowired AiKeyManagementService keys;
    @Autowired AiQuotaSettingsService quota;
    @Autowired AiProviderConfigRepository configs;
    @Autowired ConfigSecretCipher cipher;
    @Autowired MockMvc mvc;
    @MockitoBean ChatProviderClient client;
    @MockitoBean OtpSender otp;

    @Test void repeatedSwapsKeepIdentityNamesQuotaHistoryAndRejectStaleConfiguration() {
        when(client.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        var saved = providers.save(new AiSettingsRequest("GEMINI", "test-model", "private-primary-AAAA", null,
                false, List.of(new AiBackupKeyRequest(null, "Project B", "private-backup-BBBB"),
                        new AiBackupKeyRequest(null, "Project C", "private-backup-CCCC")), null));
        long originalId = Long.parseLong(saved.id());
        keys.rename(originalId, "PRIMARY", "Project A");
        providers.test(new AiSettingsRequest("GEMINI", "test-model", null, null, false));
        providers.activate("GEMINI", originalId);
        var before = keys.get("GEMINI");
        var identityA = before.keys().getFirst().identity();
        var identityB = before.keys().get(1).identity();
        quota.save(new AiQuotaSettingsService.SaveInput(originalId, List.of(
                new AiQuotaSettingsService.KeyInput("PRIMARY", "project-a", 1000L),
                new AiQuotaSettingsService.KeyInput(before.keys().get(1).keyRef(), "project-b", 2000L),
                new AiQuotaSettingsService.KeyInput(before.keys().get(2).keyRef(), "project-c", 3000L))));
        clearInvocations(client);
        keys.promote(originalId, Long.parseLong(before.keys().get(1).keyRef()));
        var after = keys.get("GEMINI");
        assertEquals(List.of("Project B", "Project A", "Project C"), after.keys().stream().map(AiKeyManagementService.KeyView::name).toList());
        assertEquals(identityB, after.keys().getFirst().identity());
        assertEquals(identityA, after.keys().get(1).identity());
        assertNotNull(after.keys().getFirst().lastPrimaryAt());
        assertNotNull(after.keys().get(1).lastPrimaryAt());
        assertEquals(List.of("project-b", "project-a", "project-c"), quota.get().keys().stream().map(AiQuotaSettingsService.KeyView::projectName).toList());
        assertEquals(List.of(2000L, 1000L, 3000L), quota.get().keys().stream().map(AiQuotaSettingsService.KeyView::tpmLimit).toList());
        assertEquals(1, configs.findAllByActiveTrue().size());
        assertEquals("private-backup-BBBB", cipher.decrypt("GEMINI", configs.findAllByActiveTrue().getFirst().getKeyCipher()));
        assertThrows(InvalidAiConfigurationException.class, () -> keys.promote(originalId, Long.parseLong(before.keys().get(1).keyRef())));
        assertEquals(2, keys.get("GEMINI").history().size());
        keys.promote(Long.parseLong(after.configId()), Long.parseLong(after.keys().get(1).keyRef()));
        var repeated = keys.get("GEMINI");
        assertEquals("Project A", repeated.keys().getFirst().name());
        assertEquals(identityA, repeated.keys().getFirst().identity());
        assertEquals("Project B", repeated.history().getFirst().fromName());
        assertEquals("Project A", repeated.history().getFirst().toName());
        assertEquals(3, repeated.history().size());
        assertFalse(repeated.toString().contains("private-"));
        assertEquals(1, configs.findAllByActiveTrue().size());
        verifyNoInteractions(client);
        assertEquals(2, keys.get("GEMINI", repeated.history().getFirst().id()).history().size());
        assertThrows(InvalidAiConfigurationException.class, () -> keys.promote(Long.parseLong(repeated.configId()), Long.MAX_VALUE));
        assertEquals(3, keys.get("GEMINI").history().size());
    }

    @Test void managementEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/admin/ai-settings/key-management").param("provider", "GEMINI"))
                .andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"GROQ", "DEEPSEEK"})
    void canPromoteSecondBackupWithoutMovingOtherBackups(String provider) {
        when(client.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        var saved = providers.save(new AiSettingsRequest(provider, "test-model", "original-primary-AAAA", null,
                false, List.of(new AiBackupKeyRequest(null, "Project B", "first-backup-BBBB"),
                        new AiBackupKeyRequest(null, "Project C", "second-backup-CCCC")), null));
        long configId = Long.parseLong(saved.id());
        keys.rename(configId, "PRIMARY", "Project A");
        providers.test(new AiSettingsRequest(provider, "test-model", null, null, false));
        providers.activate(provider, configId);
        var before = keys.get(provider);
        keys.promote(configId, Long.parseLong(before.keys().get(2).keyRef()));
        var after = keys.get(provider);
        assertEquals(List.of("Project C", "Project B", "Project A"), after.keys().stream().map(AiKeyManagementService.KeyView::name).toList());
        assertEquals(before.keys().get(2).identity(), after.keys().getFirst().identity());
        assertEquals(before.keys().get(1).identity(), after.keys().get(1).identity());
        assertEquals(before.keys().getFirst().identity(), after.keys().get(2).identity());
        assertEquals(1, configs.findAllByActiveTrue().size());
        assertEquals("OK", providers.chat("question"));
        verify(client).chat(provider, "test-model", "second-backup-CCCC", "question");
    }
}
