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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.ai.embedding.EmbeddingModel;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChatProviderConfigurationTest {
    private final AiProviderConfigRepository chatConfigs = mock(AiProviderConfigRepository.class);
    private final EmbeddingConfigRepository embeddingConfigs = mock(EmbeddingConfigRepository.class);
    private final KnowledgeDocumentRepository documents = mock(KnowledgeDocumentRepository.class);
    private final SystemSettingRepository settings = mock(SystemSettingRepository.class);
    private final ConfigSecretCipher cipher = mock(ConfigSecretCipher.class);
    private final ChatProviderClient client = mock(ChatProviderClient.class);
    private final EmbeddingModelFactory factory = mock(EmbeddingModelFactory.class);
    private final AiProviderServiceImpl chat = new AiProviderServiceImpl(chatConfigs, settings, cipher, client, Clock.systemUTC(), mock(com.smartphoneai.service.AiKeyAlertService.class), mock(com.smartphoneai.repository.AiBackupKeyRepository.class));
    private final EmbeddingSettingsServiceImpl embedding = new EmbeddingSettingsServiceImpl(embeddingConfigs, documents, settings, cipher, factory);

    @ParameterizedTest
    @ValueSource(strings={"GEMINI","GROQ","DEEPSEEK"})
    void directPhoneKnowledgeUsesTheActivePlatformModelAndSavedKey(String platform) {
        var configured = new AiProviderConfig(platform, "configured-model", "saved-cipher", null, Instant.now());
        configured.setActive(true);
        when(chatConfigs.findAllByActiveTrue()).thenReturn(List.of(configured));
        when(cipher.decrypt(platform, "saved-cipher")).thenReturn("saved-private-key");
        when(client.chat(eq(platform), eq("configured-model"), eq("saved-private-key"), anyString()))
                .thenReturn("{\"answer\":\"Hạn chế nhiệt độ cao khi sử dụng điện thoại.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var products = mock(com.smartphoneai.repository.ProductRepository.class);
        var rag = mock(com.smartphoneai.service.RagService.class);
        var phones = new com.smartphoneai.service.impl.PhoneAssistanceServiceImpl(products, chat,
                new com.fasterxml.jackson.databind.ObjectMapper(), rag);
        var answer = phones.advise("Cách bảo vệ pin điện thoại?", List.of(), List.of(),
                new com.smartphoneai.service.TopicRouter.Decision("SAME_TOPIC", null, false, false));
        assertEquals("Hạn chế nhiệt độ cao khi sử dụng điện thoại.", answer.text());
        verify(client).chat(eq(platform), eq("configured-model"), eq("saved-private-key"),
                argThat(prompt -> prompt.contains("chỉ trong phạm vi điện thoại")));
        verifyNoInteractions(products, rag);
    }

    @Test void directServiceCallsRejectUnsupportedProviderBeforeReadingOrWritingConfiguration() {
        var request = new AiSettingsRequest("OPENAI", "legacy-model", "legacy-key", null, false);
        assertThrows(InvalidAiConfigurationException.class, () -> chat.save(request));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.test(request));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.activate("OPENAI"));
        assertThrows(InvalidAiConfigurationException.class, () -> embedding.configure(
                new EmbeddingSettingsRequest("OPENAI", "legacy-model", "legacy-key", 3)));
        verifyNoInteractions(chatConfigs, embeddingConfigs, settings, cipher, client, factory);
    }

    @Test void chatListAlwaysProvidesEverySupportedPlatformWithoutExposingLegacyRows() {
        var legacy = legacyChat();
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of(legacy));
        var result = chat.list();
        assertEquals(List.of("GEMINI", "GROQ", "DEEPSEEK"), result.stream().map(r -> r.provider()).toList());
        for (var entry : result) {
            assertEquals("", entry.maskedKey());
            assertFalse(entry.active());
            assertFalse(entry.tested());
        }
        assertTrue(legacy.isActive());
        verifyNoInteractions(cipher, client);
    }

    @Test void freshInstallProvidesUnconfiguredPlatforms() {
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of());
        var result = chat.list();
        assertEquals(List.of("GEMINI", "GROQ", "DEEPSEEK"), result.stream().map(r -> r.provider()).toList());
        assertTrue(result.stream().allMatch(r -> r.maskedKey().isEmpty() && !r.active()));
    }

    @Test void configuredPlatformKeepsItsRowAndOthersStayAvailable() {
        var groq = new AiProviderConfig("GROQ", "llama-3.3-70b-versatile", "groq-cipher", null, Instant.now());
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of(groq));
        var result = chat.list();
        assertEquals(List.of("GROQ", "GEMINI", "DEEPSEEK"), result.stream().map(r -> r.provider()).toList());
        assertEquals("llama-3.3-70b-versatile", result.getFirst().model());
        assertEquals("••••••••", result.getFirst().maskedKey());
    }

    @Test void activatingAnotherPlatformSwitchesTheSingleActiveChatConfiguration() {
        var gemini = new AiProviderConfig("GEMINI", "gemini-model", "gemini-cipher", null, Instant.now());
        gemini.markTested();
        gemini.setActive(true);
        var deepseek = new AiProviderConfig("DEEPSEEK", "deepseek-chat", "deepseek-cipher", null, Instant.now());
        deepseek.markTested();
        when(settings.findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
        when(chatConfigs.findFirstByProviderOrderByIdDesc("DEEPSEEK")).thenReturn(Optional.of(deepseek));
        when(chatConfigs.findAllByActiveTrue()).thenReturn(List.of(gemini));
        when(chatConfigs.findAllByOrderByIdDesc()).thenReturn(List.of(deepseek, gemini));
        var result = chat.activate("DEEPSEEK");
        assertFalse(gemini.isActive());
        assertTrue(deepseek.isActive());
        assertEquals(List.of("DEEPSEEK"), result.stream().filter(r -> r.active()).map(r -> r.provider()).toList());
    }

    @Test void untestedPlatformCannotBeActivated() {
        var groq = new AiProviderConfig("GROQ", "llama-3.3-70b-versatile", "groq-cipher", null, Instant.now());
        when(settings.findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
        when(chatConfigs.findFirstByProviderOrderByIdDesc("GROQ")).thenReturn(Optional.of(groq));
        assertThrows(InvalidAiConfigurationException.class, () -> chat.activate("GROQ"));
        assertFalse(groq.isActive());
    }

    @Test void savedKeysAreBoundToTheirOwnPlatform() {
        when(settings.findLockedSingleton()).thenReturn(Optional.of(mock(SystemSetting.class)));
        when(chatConfigs.findFirstByProviderOrderByIdDesc("GROQ")).thenReturn(Optional.empty());
        when(cipher.encrypt(eq("GROQ"), anyString())).thenAnswer(call -> "enc:" + call.getArgument(1));
        when(cipher.decrypt(eq("GROQ"), anyString())).thenAnswer(call -> call.<String>getArgument(1).substring(4));
        when(chatConfigs.save(any())).thenAnswer(call -> call.getArgument(0));
        chat.save(new AiSettingsRequest("GROQ", "llama-3.3-70b-versatile", "gsk-primary", "gsk-backup", false));
        verify(cipher).encrypt("GROQ", "gsk-primary");
        verify(cipher).encrypt("GROQ", "gsk-backup");
        verify(cipher, never()).encrypt(eq("GEMINI"), anyString());
    }

    @Test void activeGroqChatUsesItsOwnKeyAndProviderSpecificQuotaRotation() {
        var groq = new AiProviderConfig("GROQ", "llama-3.3-70b-versatile", "groq-cipher", null, Instant.now());
        groq.markTested();
        groq.setActive(true);
        var quota = mock(com.smartphoneai.service.impl.AiQuotaTracker.class);
        when(quota.configured()).thenReturn(true);
        when(quota.reserve(eq("GROQ"),anyList(),eq("llama-3.3-70b-versatile"),eq("question"),anySet()))
                .thenReturn(new com.smartphoneai.service.impl.AiQuotaTracker.Reservation("PRIMARY",java.util.UUID.randomUUID(),"groq-group",false));
        chat.setQuota(quota);
        when(chatConfigs.findAllByActiveTrue()).thenReturn(List.of(groq));
        when(cipher.decrypt("GROQ", "groq-cipher")).thenReturn("gsk-primary");
        when(client.chat("GROQ", "llama-3.3-70b-versatile", "gsk-primary", "question")).thenReturn("answer");
        assertEquals("answer", chat.chat("question"));
        verify(quota, never()).reserve(any(), any(), any(), any());
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
        assertEquals(3, result.size());
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
        assertEquals("GEMINI", description.get("provider"));
        assertEquals("gemini-embedding-001", description.get("model"));
        assertEquals(768, description.get("dimensions"));
        assertEquals("", description.get("maskedKey"));
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
