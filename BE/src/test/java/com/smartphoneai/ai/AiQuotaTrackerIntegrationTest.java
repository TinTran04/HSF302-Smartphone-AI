package com.smartphoneai.ai;

import com.smartphoneai.service.impl.AiQuotaTracker;
import org.junit.jupiter.api.*;
import org.springframework.context.annotation.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.*;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import javax.sql.DataSource;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

class AiQuotaTrackerIntegrationTest {
    static final Instant NOW = Instant.parse("2026-01-01T12:00:00Z");
    AnnotationConfigApplicationContext context;
    JdbcTemplate jdbc;
    AiQuotaTracker tracker;
    UUID projectA, projectB;
    List<AiQuotaTracker.Key> keys;

    @Configuration @EnableTransactionManagement
    static class Config {
        @Bean DataSource dataSource() {
            var ds = new DriverManagerDataSource("jdbc:h2:mem:quota;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000", "sa", "");
            new ResourceDatabasePopulator(new ClassPathResource("db/migration/V34__ai_project_quota.sql")).execute(ds);
            return ds;
        }
        @Bean JdbcTemplate jdbc(DataSource ds) { return new JdbcTemplate(ds); }
        @Bean DataSourceTransactionManager transactionManager(DataSource ds) { return new DataSourceTransactionManager(ds); }
        @Bean Clock clock() { return Clock.fixed(NOW, ZoneOffset.UTC); }
        @Bean AiQuotaTracker tracker(JdbcTemplate jdbc, Clock clock) { return new AiQuotaTracker(jdbc, clock); }
    }

    @BeforeEach void setup() {
        context = new AnnotationConfigApplicationContext(Config.class);
        jdbc = context.getBean(JdbcTemplate.class);
        tracker = context.getBean(AiQuotaTracker.class);
        projectA = project("a", 100); projectB = project("b", 100);
        keys = List.of(key("primary", "secret1", projectA), key("same", "secret2", projectA), key("other", "secret3", projectB));
    }
    @AfterEach void cleanup() {
        jdbc.execute("DROP ALL OBJECTS");
        context.close();
    }
    UUID project(String name, long limit) {
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO ai_quota_projects(id,project_name) VALUES(?,?)", id, name);
        jdbc.update("INSERT INTO ai_quota_project_limits(project_id,model,tpm_limit) VALUES(?,?,?)", id, "gemini", limit);
        return id;
    }
    AiQuotaTracker.Key key(String ref, String secret, UUID project) {
        String fingerprint = AiQuotaTracker.fingerprint(secret);
        jdbc.update("INSERT INTO ai_quota_keys(key_fingerprint,project_id) VALUES(?,?)", fingerprint, project);
        return new AiQuotaTracker.Key(ref, fingerprint);
    }
    void usage(UUID project, String model, long tokens, Instant time) {
        jdbc.update("INSERT INTO ai_quota_usage(id,project_id,model,input_tokens,created_at) VALUES(?,?,?,?,?)", UUID.randomUUID(), project, model, tokens, java.sql.Timestamp.from(time));
    }
    @Test void rotatesAtEightyPercentIncludingKeysInSameProject() {
        usage(projectA, "gemini", 80, NOW);
        var reservation = tracker.reserve(keys, "gemini", "hello", Set.of());
        assertEquals("other", reservation.reference());
        assertEquals("b", reservation.project());
        assertTrue(reservation.proactive());
    }
    @Test void ignoresExpiredAndOtherModelUsage() {
        usage(projectA, "gemini", 80, NOW.minusSeconds(61));
        usage(projectA, "different-model", 80, NOW);
        var reservation = tracker.reserve(keys, "gemini", "hello", Set.of());
        assertEquals("primary", reservation.reference());
    }
    @Test void replacesEstimateWithProviderInputTokens() {
        var reservation = tracker.reserve(keys, "gemini", "1234567890", Set.of());
        tracker.finish(reservation.usageId(), 80);
        assertEquals("other", tracker.reserve(keys, "gemini", "x", Set.of()).reference());
    }
    @Test void simultaneousReservationsObserveCommittedEstimates() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(10);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<String>> calls = new ArrayList<>();
            for (int i = 0; i < 10; i++) calls.add(pool.submit(() -> {
                start.await();
                return tracker.reserve(keys, "gemini", "1234567890", Set.of()).reference();
            }));
            start.countDown();
            List<String> selected = new ArrayList<>();
            for (var call : calls) selected.add(call.get(20, TimeUnit.SECONDS));
            assertEquals(8, selected.stream().filter("primary"::equals).count());
            assertEquals(2, selected.stream().filter("other"::equals).count());
        } finally { pool.shutdownNow(); }
    }
}

