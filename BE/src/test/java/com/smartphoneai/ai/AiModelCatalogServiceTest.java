package com.smartphoneai.ai;

import com.smartphoneai.dto.request.AiModelOptionsRequest;
import com.smartphoneai.dto.response.AiModelOptionsResponse.Option;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.service.AiModelDirectory;
import com.smartphoneai.service.AiModelDirectory.ListedModel;
import com.smartphoneai.service.AiModelDirectory.RateLimits;
import com.smartphoneai.service.impl.AiModelCatalogServiceImpl;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AiModelCatalogServiceTest {
    private final AiProviderConfigRepository configs = mock(AiProviderConfigRepository.class);
    private final ConfigSecretCipher cipher = mock(ConfigSecretCipher.class);
    private final AiModelDirectory directory = mock(AiModelDirectory.class);
    private final MutableClock clock = new MutableClock(Instant.parse("2026-11-12T00:00:00Z"));
    private final AiModelCatalogServiceImpl catalog = new AiModelCatalogServiceImpl(configs, cipher, directory, clock);

    private static List<ListedModel> models(String... ids) {
        return java.util.Arrays.stream(ids).map(id -> new ListedModel(id, id)).toList();
    }

    @Test void groqRanksByLiveRequestsPerDayThenTokensAndSkipsModelsThatCannotBeProbed() {
        when(directory.listChatModels("GROQ", "gsk")).thenReturn(models("a", "b", "c", "d", "e"));
        when(directory.probeLimits("GROQ", "a", "gsk")).thenReturn(Optional.of(new RateLimits(1_000L, 8_000L)));
        when(directory.probeLimits("GROQ", "b", "gsk")).thenReturn(Optional.of(new RateLimits(14_400L, 6_000L)));
        when(directory.probeLimits("GROQ", "c", "gsk")).thenReturn(Optional.of(new RateLimits(1_000L, 12_000L)));
        when(directory.probeLimits("GROQ", "d", "gsk")).thenReturn(Optional.empty());
        when(directory.probeLimits("GROQ", "e", "gsk")).thenThrow(new AiProviderException(404));
        var result = catalog.options(new AiModelOptionsRequest("GROQ", "gsk"));
        assertEquals("LIVE", result.source());
        assertEquals(List.of(new Option("b", "b", 14_400L, 6_000L), new Option("c", "c", 1_000L, 12_000L),
                new Option("a", "a", 1_000L, 8_000L)), result.models());
    }

    @Test void groqStopsWhenTheKeyIsRejected() {
        when(directory.listChatModels("GROQ", "bad")).thenReturn(models("a"));
        when(directory.probeLimits("GROQ", "a", "bad")).thenThrow(new AiProviderException(401));
        assertEquals("AI_PROVIDER_AUTH_ERROR", assertThrows(AiProviderException.class,
                () -> catalog.options(new AiModelOptionsRequest("GROQ", "bad"))).getCode());
    }

    @Test void groqWithoutReadableLimitsStillOffersModels() {
        when(directory.listChatModels("GROQ", "gsk")).thenReturn(models("a", "b", "c", "d"));
        when(directory.probeLimits(anyString(), anyString(), anyString())).thenReturn(Optional.empty());
        var result = catalog.options(new AiModelOptionsRequest("GROQ", "gsk"));
        assertEquals("NONE", result.source());
        assertEquals(List.of("a", "b", "c"), result.models().stream().map(Option::id).toList());
        assertNull(result.models().getFirst().requestsPerDay());
    }

    @Test void geminiPrefersFlashLiteThenFlashThenProAndNewerStableVersions() {
        when(directory.listChatModels("GEMINI", "g")).thenReturn(models("gemini-3.5-pro", "gemini-2.5-flash",
                "gemini-3.6-flash", "gemini-3.6-flash-lite-preview", "gemini-3.6-flash-lite", "gemini-3.0-flash-lite"));
        var result = catalog.options(new AiModelOptionsRequest("GEMINI", "g"));
        assertEquals("ESTIMATE", result.source());
        assertEquals(List.of("gemini-3.6-flash-lite", "gemini-3.6-flash-lite-preview", "gemini-3.0-flash-lite"),
                result.models().stream().map(Option::id).toList());
        assertEquals(1_000L, result.models().getFirst().requestsPerDay());
        verify(directory, never()).probeLimits(any(), any(), any());
    }

    @Test void deepSeekHasNoFreeTierAndListsAvailableModels() {
        when(directory.listChatModels("DEEPSEEK", "sk")).thenReturn(models("deepseek-reasoner", "deepseek-chat"));
        var result = catalog.options(new AiModelOptionsRequest("DEEPSEEK", "sk"));
        assertEquals("NONE", result.source());
        assertTrue(result.note().contains("không có gói miễn phí"));
        assertEquals(List.of("deepseek-chat", "deepseek-reasoner"), result.models().stream().map(Option::id).toList());
    }

    @Test void blankKeyUsesTheSavedPrimaryKeyOfThatPlatform() {
        var saved = new AiProviderConfig("DEEPSEEK", "deepseek-chat", "cipher-text", null, Instant.now());
        when(configs.findFirstByProviderOrderByIdDesc("DEEPSEEK")).thenReturn(Optional.of(saved));
        when(cipher.decrypt("DEEPSEEK", "cipher-text")).thenReturn("saved-key");
        when(directory.listChatModels("DEEPSEEK", "saved-key")).thenReturn(models("deepseek-chat"));
        assertEquals(1, catalog.options(new AiModelOptionsRequest("DEEPSEEK", " ")).models().size());
    }

    @Test void blankKeyWithoutSavedConfigurationIsRejected() {
        when(configs.findFirstByProviderOrderByIdDesc("GROQ")).thenReturn(Optional.empty());
        assertThrows(InvalidAiConfigurationException.class, () -> catalog.options(new AiModelOptionsRequest("GROQ", null)));
        verifyNoInteractions(directory);
    }

    @Test void resultsAreReusedForTenMinutesSoGroqIsNotProbedRepeatedly() {
        when(directory.listChatModels("GROQ", "gsk")).thenReturn(models("a"));
        when(directory.probeLimits("GROQ", "a", "gsk")).thenReturn(Optional.of(new RateLimits(1L, 1L)));
        catalog.options(new AiModelOptionsRequest("GROQ", "gsk"));
        clock.advance(Duration.ofMinutes(9));
        catalog.options(new AiModelOptionsRequest("GROQ", "gsk"));
        verify(directory, times(1)).probeLimits("GROQ", "a", "gsk");
        clock.advance(Duration.ofMinutes(2));
        catalog.options(new AiModelOptionsRequest("GROQ", "gsk"));
        verify(directory, times(2)).probeLimits("GROQ", "a", "gsk");
    }

    @Test void unsupportedProviderIsRejectedBeforeAnyCall() {
        assertThrows(InvalidAiConfigurationException.class, () -> catalog.options(new AiModelOptionsRequest("OPENAI", "k")));
        verifyNoInteractions(directory, configs);
    }

    private static final class MutableClock extends Clock {
        private Instant now;
        MutableClock(Instant now) { this.now = now; }
        void advance(Duration duration) { now = now.plus(duration); }
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
