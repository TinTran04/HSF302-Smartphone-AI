package com.smartphoneai.ai;

import com.smartphoneai.entity.*;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.impl.AiQuotaSettingsService;
import com.smartphoneai.service.support.ConfigSecretCipher;
import org.junit.jupiter.api.*;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.Clock;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AiQuotaSettingsIntegrationTest {
    @Configuration @Import(AiQuotaTrackerIntegrationTest.Config.class)
    static class Config {
        @Bean AiProviderConfigRepository configs() { return mock(AiProviderConfigRepository.class); }
        @Bean AiBackupKeyRepository backups() { return mock(AiBackupKeyRepository.class); }
        @Bean SystemSettingRepository system() { return mock(SystemSettingRepository.class); }
        @Bean ConfigSecretCipher cipher() { return new ConfigSecretCipher(Base64.getEncoder().encodeToString(new byte[32])); }
        @Bean AiQuotaSettingsService settings(AiProviderConfigRepository configs, AiBackupKeyRepository backups,
                SystemSettingRepository system, ConfigSecretCipher cipher, JdbcTemplate jdbc, Clock clock) {
            return new AiQuotaSettingsService(configs, backups, system, cipher, jdbc, clock);
        }
    }
    AnnotationConfigApplicationContext context;
    AiQuotaSettingsService settings;
    JdbcTemplate jdbc;
    @BeforeEach void setup() {
        context = new AnnotationConfigApplicationContext(Config.class);
        settings = context.getBean(AiQuotaSettingsService.class);
        jdbc = context.getBean(JdbcTemplate.class);
        var cipher = context.getBean(ConfigSecretCipher.class);
        var config = mock(AiProviderConfig.class);
        when(config.getId()).thenReturn(1L);
        when(config.hasKeys()).thenReturn(true);
        when(config.getModel()).thenReturn("gemini");
        when(config.getKeyCipher()).thenReturn(cipher.encrypt("GEMINI", "primary-secret"));
        var backup = mock(AiBackupKey.class);
        when(backup.getId()).thenReturn(2L);
        when(backup.getName()).thenReturn("Backup");
        when(backup.getMaskedKey()).thenReturn("***");
        when(backup.getKeyCipher()).thenReturn(cipher.encrypt("GEMINI", "backup-secret"));
        when(context.getBean(AiProviderConfigRepository.class).findFirstByProviderOrderByIdDesc("GEMINI")).thenReturn(Optional.of(config));
        when(context.getBean(AiBackupKeyRepository.class).findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(backup));
        when(context.getBean(SystemSettingRepository.class).findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
    }
    @AfterEach void cleanup() { jdbc.execute("DROP ALL OBJECTS"); context.close(); }
    static AiQuotaSettingsService.KeyInput key(String ref, String project, Long limit) {
        return new AiQuotaSettingsService.KeyInput(ref, project, limit);
    }
    @Test void savePersistsSharedProjectAndUpdatesItsLimit() {
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", " Project-A ", 100L), key("2", "project-a", 100L))));
        var loaded = settings.get();
        assertEquals(List.of("project-a", "project-a"), loaded.keys().stream().map(AiQuotaSettingsService.KeyView::projectName).toList());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM ai_quota_projects", Integer.class));
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "project-a", 200L), key("2", "project-a", 200L))));
        assertEquals(List.of(200L, 200L), settings.get().keys().stream().map(AiQuotaSettingsService.KeyView::tpmLimit).toList());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM ai_quota_keys WHERE key_fingerprint IN ('primary-secret', 'backup-secret')", Integer.class));
    }
    @Test void savingAnotherModelPreservesOriginalModelLimit() {
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "a", 100L), key("2", "a", 100L))));
        var config = context.getBean(AiProviderConfigRepository.class).findFirstByProviderOrderByIdDesc("GEMINI").orElseThrow();
        when(config.getModel()).thenReturn("other-model");
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "a", 200L), key("2", "a", 200L))));
        when(config.getModel()).thenReturn("gemini");
        assertEquals(List.of(100L, 100L), settings.get().keys().stream().map(AiQuotaSettingsService.KeyView::tpmLimit).toList());
    }
    @Test void rejectsStaleOrTamperedConfigurationWithoutChangingSavedValues() {
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "a", 100L), key("2", "a", 100L))));
        assertThrows(InvalidAiConfigurationException.class, () -> settings.save(new AiQuotaSettingsService.SaveInput(9L, List.of(key("PRIMARY", "b", 1L), key("2", "b", 1L)))));
        assertThrows(InvalidAiConfigurationException.class, () -> settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "b", 1L), key("unknown", "b", 1L)))));
        assertThrows(InvalidAiConfigurationException.class, () -> settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "a", 100L), key("2", "a", 200L)))));
        assertEquals(List.of("a", "a"), settings.get().keys().stream().map(AiQuotaSettingsService.KeyView::projectName).toList());
    }

    @Test void showsDefaultGeminiLimitBeforeManualConfiguration() {
        var config = context.getBean(AiProviderConfigRepository.class).findFirstByProviderOrderByIdDesc("GEMINI").orElseThrow();
        when(config.getModel()).thenReturn("gemini-3.1-flash-lite");
        var result = settings.get();
        assertEquals(250000L, result.keys().getFirst().tpmLimit());
        assertEquals("DEFAULT", result.keys().getFirst().limitSource());
        assertNull(result.keys().getFirst().projectName());
        var json = new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules()
                .disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .valueToTree(result.keys().getFirst());
        assertEquals(1000L, json.path("dailyRequestLimit").asLong());
        assertEquals(0L, json.path("requestsToday").asLong());
        assertEquals("DEFAULT", json.path("dailyLimitSource").asText());
        assertEquals("2026-01-02T08:00:00Z", json.path("dailyResetAt").asText());
    }

    @Test void scopesQuotaAndDefaultsToTheSelectedProviderAndModel() {
        var configs = context.getBean(AiProviderConfigRepository.class);
        var cipher = context.getBean(ConfigSecretCipher.class);
        var groq = mock(AiProviderConfig.class);
        when(groq.getId()).thenReturn(3L);
        when(groq.hasKeys()).thenReturn(true);
        when(groq.getModel()).thenReturn("llama-3.3-70b-versatile");
        when(groq.getKeyCipher()).thenReturn(cipher.encrypt("GROQ", "primary-secret"));
        when(configs.findFirstByProviderOrderByIdDesc("GROQ")).thenReturn(Optional.of(groq));
        settings.save(new AiQuotaSettingsService.SaveInput(3L, List.of(key("PRIMARY", "a", 6000L)), "GROQ"));
        settings.save(new AiQuotaSettingsService.SaveInput(1L, List.of(key("PRIMARY", "a", 100L), key("2", "a", 100L))));
        assertEquals(6000L, settings.get("GROQ", null).keys().getFirst().tpmLimit());
        assertEquals(100L, settings.get().keys().getFirst().tpmLimit());
        assertNull(settings.get("GROQ", "another-model").keys().getFirst().tpmLimit());
    }
}

