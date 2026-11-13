package com.smartphoneai.ai;

import com.smartphoneai.service.impl.AiDailyQuotaService;
import com.smartphoneai.service.impl.AiQuotaTracker;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.*;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import static org.junit.jupiter.api.Assertions.*;

class AiDailyQuotaIntegrationTest {
    @Configuration @Import(AiQuotaTrackerIntegrationTest.Config.class)
    static class Config {
        @Bean AiDailyQuotaService daily(JdbcTemplate jdbc, Clock clock) { return new AiDailyQuotaService(jdbc, clock); }
    }
    AnnotationConfigApplicationContext context;
    AiDailyQuotaService daily;
    AiQuotaTracker groups;
    JdbcTemplate jdbc;
    TransactionTemplate transaction;

    @BeforeEach void setup() {
        context = new AnnotationConfigApplicationContext(Config.class);
        daily = context.getBean(AiDailyQuotaService.class);
        groups = context.getBean(AiQuotaTracker.class);
        jdbc = context.getBean(JdbcTemplate.class);
        transaction = new TransactionTemplate(context.getBean(PlatformTransactionManager.class));
    }
    @AfterEach void cleanup() { jdbc.execute("DROP ALL OBJECTS"); context.close(); }
    void configure(String provider, String secret, String model, String group, Long limit) {
        transaction.executeWithoutResult(status -> {
            groups.configure(provider, AiQuotaTracker.fingerprint(secret), model, group, 250000L, "DEFAULT");
            if (limit != null) daily.configure(provider, model, AiQuotaTracker.fingerprint(secret), limit, false);
        });
    }
    AiDailyQuotaService.Usage usage(String provider, String secret, String model) {
        return daily.get(provider, model, AiQuotaTracker.fingerprint(secret));
    }

    @Test void sharesDailyCountersForKeysInAGroupAndKeepsModelAndProviderIsolation() {
        configure("GEMINI", "first", "gemini-3.5-flash-lite", "same-project", 500L);
        configure("GEMINI", "backup", "gemini-3.5-flash-lite", "same-project", null);
        daily.recordRequest("GEMINI", "gemini-3.5-flash-lite", "first");
        daily.recordRequest("GEMINI", "gemini-3.5-flash-lite", "backup");
        daily.recordRequest("GEMINI", "gemini-3.1-flash-lite", "first");
        daily.recordRequest("GROQ", "gemini-3.5-flash-lite", "first");
        assertEquals(2, usage("GEMINI", "first", "gemini-3.5-flash-lite").requestsToday());
        assertEquals(2, usage("GEMINI", "backup", "gemini-3.5-flash-lite").requestsToday());
        assertEquals(500L, usage("GEMINI", "backup", "gemini-3.5-flash-lite").dailyRequestLimit());
        assertEquals(1, usage("GEMINI", "first", "gemini-3.1-flash-lite").requestsToday());
        assertEquals(1, usage("GROQ", "first", "gemini-3.5-flash-lite").requestsToday());
        assertNull(usage("GROQ", "first", "gemini-3.5-flash-lite").dailyRequestLimit());
    }

    @Test void countersRemainAfterMinuteExpiryAndResetAtPacificMidnightForGemini() {
        daily.recordRequest("GEMINI", "gemini-3.5-flash-lite", "first");
        var later = new AiDailyQuotaService(jdbc, Clock.fixed(Instant.parse("2026-01-01T12:02:00Z"), ZoneOffset.UTC));
        var sameDay = later.get("GEMINI", "gemini-3.5-flash-lite", AiQuotaTracker.fingerprint("first"));
        assertEquals(1, sameDay.requestsToday());
        assertEquals(Instant.parse("2026-01-02T08:00:00Z"), sameDay.dailyResetAt());
        var nextDay = new AiDailyQuotaService(jdbc, Clock.fixed(sameDay.dailyResetAt(), ZoneOffset.UTC));
        assertEquals(0, nextDay.get("GEMINI", "gemini-3.5-flash-lite", AiQuotaTracker.fingerprint("first")).requestsToday());
        assertNotNull(sameDay.dailyTrackingSince());
    }

    @Test void observedLimitsDoNotOverwriteManualAndCanBeRestoredForTheSharedGroup() {
        configure("GROQ", "first", "llama", "organization", 500L);
        configure("GROQ", "backup", "llama", "organization", null);
        daily.observeLimit("GROQ", "llama", "first", 1000L);
        assertEquals(500L, usage("GROQ", "first", "llama").dailyRequestLimit());
        assertEquals("MANUAL", usage("GROQ", "first", "llama").dailyLimitSource());
        transaction.executeWithoutResult(status -> daily.configure("GROQ", "llama", AiQuotaTracker.fingerprint("backup"), null, true));
        assertEquals(1000L, usage("GROQ", "first", "llama").dailyRequestLimit());
        assertEquals("PROVIDER", usage("GROQ", "backup", "llama").dailyLimitSource());
    }

    @Test void concurrentCallsAreEachCountedOnce() throws Exception {
        try (var executor = Executors.newFixedThreadPool(8)) {
            var tasks = java.util.stream.IntStream.range(0, 24)
                    .<java.util.concurrent.Callable<Void>>mapToObj(index -> () -> {
                        daily.recordRequest("GEMINI", "gemini-3.5-flash-lite", "same-secret");
                        return null;
                    }).toList();
            for (var result : executor.invokeAll(tasks)) result.get(10, TimeUnit.SECONDS);
        }
        assertEquals(24, usage("GEMINI", "same-secret", "gemini-3.5-flash-lite").requestsToday());
    }

    @Test void utcProvidersAndPacificDaylightSavingUseTheirOwnDayBoundaries() {
        assertEquals(Instant.parse("2026-01-02T00:00:00Z"), usage("GROQ", "key", "model").dailyResetAt());
        var daylightSaving = new AiDailyQuotaService(jdbc,
                Clock.fixed(Instant.parse("2026-03-08T09:00:00Z"), ZoneOffset.UTC));
        assertEquals(Instant.parse("2026-03-09T07:00:00Z"),
                daylightSaving.get("GEMINI", "model", AiQuotaTracker.fingerprint("key")).dailyResetAt());
    }

    @Test void groqModelProbesAreCountedOnceAndCachedListingsDoNotConsumeMoreRequests() {
        var configs = org.mockito.Mockito.mock(com.smartphoneai.repository.AiProviderConfigRepository.class);
        var directory = org.mockito.Mockito.mock(com.smartphoneai.service.AiModelDirectory.class);
        org.mockito.Mockito.when(configs.findAllByOrderByIdDesc()).thenReturn(List.of());
        org.mockito.Mockito.when(directory.listChatModels("GROQ", "probe-secret")).thenReturn(List.of(
                new com.smartphoneai.service.AiModelDirectory.ListedModel("llama", "Llama")));
        org.mockito.Mockito.when(directory.probeLimits("GROQ", "llama", "probe-secret"))
                .thenReturn(java.util.Optional.of(new com.smartphoneai.service.AiModelDirectory.RateLimits(500L, 10000L)));
        var catalog = new com.smartphoneai.service.impl.AiModelCatalogServiceImpl(configs,
                new com.smartphoneai.service.support.ConfigSecretCipher(java.util.Base64.getEncoder().encodeToString(new byte[32])),
                directory, context.getBean(Clock.class));
        catalog.setDailyQuota(daily);
        var request = new com.smartphoneai.dto.request.AiModelOptionsRequest("GROQ", "probe-secret");
        catalog.options(request);
        catalog.options(request);
        assertEquals(1, usage("GROQ", "probe-secret", "llama").requestsToday());
        assertEquals(500L, usage("GROQ", "probe-secret", "llama").dailyRequestLimit());
        assertEquals("PROVIDER", usage("GROQ", "probe-secret", "llama").dailyLimitSource());
    }
}
