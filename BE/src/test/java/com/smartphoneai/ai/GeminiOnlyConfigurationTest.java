package com.smartphoneai.ai;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.request.EmbeddingSettingsRequest;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.entity.EmbeddingConfig;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.entity.SystemSetting;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.EmbeddingConfigRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.impl.AiProviderServiceImpl;
import com.smartphoneai.service.impl.EmbeddingSettingsServiceImpl;
import com.smartphoneai.service.impl.SpringAiProviderClient;
import com.smartphoneai.service.support.ConfigSecretCipher;
import com.smartphoneai.service.support.EmbeddingModelFactory;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GeminiOnlyConfigurationTest {
    private final AiProviderConfigRepository chatConfigs = mock(AiProviderConfigRepository.class);
    private final EmbeddingConfigRepository embeddingConfigs = mock(EmbeddingConfigRepository.class);
    private final KnowledgeDocumentRepository documents = mock(KnowledgeDocumentRepository.class);
    private final SystemSettingRepository settings = mock(SystemSettingRepository.class);
    private final ConfigSecretCipher cipher = mock(ConfigSecretCipher.class);
    private final ChatProviderClient client = mock(ChatProviderClient.class);
    private final EmbeddingModelFactory factory = mock(EmbeddingModelFactory.class);
    private final AiProviderServiceImpl chat = new AiProviderServiceImpl(chatConfigs, settings, cipher, client, Clock.systemUTC(), mock(com.smartphoneai.service.AiKeyAlertService.class), mock(com.smartphoneai.repository.AiBackupKeyRepository.class));
    private final EmbeddingSettingsServiceImpl embedding = new EmbeddingSettingsServiceImpl(embeddingConfigs, documents, settings, cipher, factory);

    @Test void directServiceCallsRejectUnsupportedProviderBeforeReadingOrWritingConfiguration() {
        var request = new AiSettingsRequest("OPENAI", "legacy-model", "legacy-key", null, false);
        assertThrows(InvalidAiConfigurationException.class, () -> chat.save(request));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.test(request));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.activate("OPENAI"));
        assertThrows(InvalidAiConfigurationException.class, () -> embedding.configure(
                new EmbeddingSettingsRequest("OPENAI", "legacy-model", "legacy-key", 3)));
        verifyNoInteractions(chatConfigs, embeddingConfigs, settings, cipher, client, factory);
    }

    @Test void chatListAlwaysProvidesGeminiWithoutExposingLegacyRows() {
        var legacy = legacyChat();
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of(legacy));
        var result = chat.list();
        assertEquals(1, result.size());
        assertEquals("GEMINI", result.getFirst().provider());
        assertEquals("", result.getFirst().maskedKey());
        assertFalse(result.getFirst().active());
        assertFalse(result.getFirst().tested());
        assertTrue(legacy.isActive());
        verifyNoInteractions(cipher, client);
    }

    @Test void freshInstallProvidesUnconfiguredGemini() {
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of());
        var result = chat.list();
        assertEquals(1, result.size());
        assertEquals("GEMINI", result.getFirst().provider());
        assertEquals("", result.getFirst().maskedKey());
        assertFalse(result.getFirst().active());
    }

    @Test void legacyActiveChatCannotDecryptOrInvokeProvider() {
        when(chatConfigs.findAllByActiveTrue()).thenReturn(List.of(legacyChat()));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.chat("question"));
        verifyNoInteractions(cipher, client);
    }

    @Test void geminiCanReplaceLegacyActiveChatAfterBeingTested() {
        var legacy = legacyChat();
        var gemini = new AiProviderConfig("GEMINI", "gemini-model", "gemini-cipher", null, Instant.now());
        gemini.markTested();
        when(settings.findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
        when(chatConfigs.findFirstByProviderOrderByIdDesc("GEMINI")).thenReturn(Optional.of(gemini));
        when(chatConfigs.findAllByActiveTrue()).thenReturn(List.of(legacy));
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of(gemini, legacy));
        var result = chat.activate("GEMINI");
        assertFalse(legacy.isActive());
        assertTrue(gemini.isActive());
        assertEquals(1, result.size());
        assertEquals("GEMINI", result.getFirst().provider());
    }

    @Test void legacyEmbeddingIsUnconfiguredAndRequiresReindexWithoutMutatingHistory() {
        var legacy = new EmbeddingConfig("OPENAI", "legacy-model", "legacy-cipher", 3);
        var doc = new KnowledgeDocument("legacy.txt", 1, "[]", Instant.now());
        doc.ready("legacy-version");
        when(embeddingConfigs.findByActiveTrue()).thenReturn(Optional.of(legacy));
        when(documents.findAll()).thenReturn(List.of(doc));
        var description = embedding.describe();
        assertEquals(false, description.get("configured"));
        assertEquals(true, description.get("reindexRequired"));
        assertFalse(description.containsKey("provider"));
        assertThrows(InvalidAiConfigurationException.class, embedding::current);
        assertTrue(legacy.isActive());
        assertEquals("legacy-version", doc.getEmbeddingVersion());
        verifyNoInteractions(cipher, factory);
    }

    @Test void geminiEmbeddingRequiresNewKeyBeforeReplacingLegacyConfiguration() {
        when(embeddingConfigs.findByActiveTrue()).thenReturn(Optional.of(
                new EmbeddingConfig("OPENAI", "legacy-model", "legacy-cipher", 3)));
        assertThrows(InvalidAiConfigurationException.class, () -> embedding.configure(
                new EmbeddingSettingsRequest("GEMINI", "gemini-embedding-model", "", 3)));
        verifyNoInteractions(cipher, factory);
    }

    @Test void geminiEmbeddingReplacementInvalidatesOldVectorsForReindex() {
        var legacy = new EmbeddingConfig("OPENAI", "legacy-model", "legacy-cipher", 3);
        var doc = new KnowledgeDocument("legacy.txt", 1, "[]", Instant.now());
        doc.ready("legacy-version");
        var model = mock(EmbeddingModel.class);
        when(embeddingConfigs.findByActiveTrue()).thenReturn(Optional.of(legacy));
        when(settings.findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
        when(factory.create("GEMINI", "gemini-embedding-model", "new-key", 3, false)).thenReturn(model);
        when(model.embed(anyString())).thenReturn(new float[]{0.1f, 0.2f, 0.3f});
        when(documents.findAll()).thenReturn(List.of(doc));
        embedding.configure(new EmbeddingSettingsRequest("GEMINI", "gemini-embedding-model", "new-key", 3));
        assertFalse(legacy.isActive());
        assertNull(doc.getEmbeddingVersion());
        assertEquals("FAILED", doc.getStatus());
        verify(embeddingConfigs).saveAndFlush(argThat(config -> config.getProvider().equals("GEMINI")));
        verify(cipher, never()).decrypt(anyString(), anyString());
    }

    @Test void productionAdaptersRejectUnsupportedProviderBeforeBuildingClients() {
        assertThrows(InvalidAiConfigurationException.class,
                () -> new SpringAiProviderClient().chat("OPENAI", "legacy-model", null, "question"));
        assertThrows(InvalidAiConfigurationException.class,
                () -> new EmbeddingModelFactory().create("OPENAI", "legacy-model", null, 3, false));
    }

    private AiProviderConfig legacyChat() {
        var legacy = new AiProviderConfig("OPENAI", "legacy-model", "legacy-cipher", null, Instant.now());
        legacy.markTested();
        legacy.setActive(true);
        return legacy;
    }
}
