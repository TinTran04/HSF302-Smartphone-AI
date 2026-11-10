package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.entity.AiKeyAlert;
import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.AiKeyAlertRepository;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.AiKeyAlertService;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.support.JwtTestClient;
import java.time.Instant;
import java.time.Duration;
import java.util.ArrayList;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:ainotifications;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=notifications-root@example.test", "app.root-admin.password=TestPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AiNotificationsIntegrationTest {
    private static final String PATH = "/api/admin/ai-settings/notifications";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AiKeyAlertRepository alerts;
    @Autowired AiBackupKeyRepository backupKeys;
    @Autowired AiKeyAlertService monitor;
    @Autowired AiProviderConfigRepository configs;
    @Autowired UserAccountRepository users;
    @Autowired AuthTokenService tokens;
    @Autowired PlatformTransactionManager transactions;
    @MockitoBean OtpSender otpSender;
    private UserAccount admin;
    private AiProviderConfig config;

    @BeforeEach void setup() {
        configs.deleteAll();
        admin = account(UserAccount.Role.ADMIN);
        config = configuration("GEMINI", true);
    }

    @Test void historyKeepsLatestFiftyButUnreadCountsAllAndScopesGemini() throws Exception {
        var ids = new ArrayList<Long>();
        for (int i = 0; i < 55; i++) ids.add(alert(config, "USING_BACKUP").getId());
        alert(configuration("OPENAI", true), "MISSING_BACKUP");
        var result = history(admin);
        assertEquals(50, result.path("items").size());
        assertEquals(55, result.path("unreadCount").asLong());
        assertEquals(ids.getLast().toString(), result.path("latestId").asText());
        assertEquals(ids.getLast().toString(), result.path("items").get(0).path("id").asText());
        assertEquals("notification-model", result.path("items").get(0).path("model").asText());
        assertEquals("AI_PROVIDER_RATE_LIMIT", result.path("items").get(0).path("reason").asText());
        assertFalse(result.path("items").get(0).path("read").asBoolean());
        assertFalse(result.path("items").get(0).path("resolved").asBoolean());
        assertFalse(result.toString().contains("private-key-cipher"));
    }

    @Test void markReadKeepsHistoryAndLeavesLaterAlertsAndOtherAdminsUnread() throws Exception {
        var first = alert(config, "USING_BACKUP");
        long observed = history(admin).path("latestId").asLong();
        var later = alert(config, "BACKUP_FAILED");
        markRead(admin, observed);
        var result = history(admin);
        assertEquals(2, result.path("items").size());
        assertEquals(1, result.path("unreadCount").asLong());
        assertEquals(later.getId().toString(), result.path("items").get(0).path("id").asText());
        assertFalse(result.path("items").get(0).path("read").asBoolean());
        assertEquals(first.getId().toString(), result.path("items").get(1).path("id").asText());
        assertTrue(result.path("items").get(1).path("read").asBoolean());
        assertEquals(2, history(account(UserAccount.Role.ADMIN)).path("unreadCount").asLong());
        markRead(admin, first.getId());
        assertEquals(1, history(admin).path("unreadCount").asLong());
        assertEquals(2, alerts.count());
    }

    @Test void futureReadWatermarkIsClampedAndResolutionDoesNotMarkRead() throws Exception {
        var warning = alert(config, "MISSING_BACKUP");
        markRead(admin, Long.MAX_VALUE);
        alert(config, "PRIMARY");
        var recovered = history(admin);
        assertEquals(1, recovered.path("unreadCount").asLong());
        assertTrue(recovered.path("items").get(0).path("resolved").asBoolean());
        assertTrue(recovered.path("items").get(1).path("resolved").asBoolean());
        assertEquals(warning.getId().toString(), recovered.path("items").get(1).path("id").asText());
        config.setActive(false);
        configs.saveAndFlush(config);
        alert(config, "BACKUP_FAILED");
        assertTrue(history(admin).path("items").get(0).path("resolved").asBoolean());
    }

    @Test void recurringFailureKeepsRecoveredIncidentAndRecoveryResolved() throws Exception {
        var original = alert(config, "USING_BACKUP");
        var recovery = alert(config, "PRIMARY");
        var recurrence = alert(config, "USING_BACKUP");
        var result = history(admin);
        var items = result.path("items");
        assertEquals(recurrence.getId().toString(), items.get(0).path("id").asText());
        assertFalse(items.get(0).path("resolved").asBoolean());
        assertEquals(recovery.getId().toString(), items.get(1).path("id").asText());
        assertTrue(items.get(1).path("resolved").asBoolean());
        assertEquals(original.getId().toString(), items.get(2).path("id").asText());
        assertTrue(items.get(2).path("resolved").asBoolean());
        assertEquals(3, result.path("unreadCount").asLong());
        assertFalse(items.get(2).path("read").asBoolean());
    }

    @Test void concurrentReadsRemainMonotonicAndPreserveCredentialChanges() throws Exception {
        long first = alert(config, "USING_BACKUP").getId();
        long latest = alert(config, "BACKUP_FAILED").getId();
        var ready = new CyclicBarrier(3);
        try (var executor = Executors.newFixedThreadPool(3)) {
            var low = executor.submit(() -> { ready.await(); markReadAuthenticated(first); return null; });
            var high = executor.submit(() -> { ready.await(); markReadAuthenticated(latest); return null; });
            var credentials = executor.submit(() -> {
                ready.await();
                new TransactionTemplate(transactions).executeWithoutResult(tx ->
                        users.findLockedById(admin.getId()).orElseThrow().changePasswordHash("new-hash"));
                return null;
            });
            low.get(10, TimeUnit.SECONDS);
            high.get(10, TimeUnit.SECONDS);
            credentials.get(10, TimeUnit.SECONDS);
        }
        var refreshed = users.findById(admin.getId()).orElseThrow();
        assertEquals(1, refreshed.getCredentialVersion());
        assertEquals("new-hash", refreshed.getPasswordHash());
        assertEquals(0, history(refreshed).path("unreadCount").asLong());
    }

    @Test void notificationsRequireAdminAndValidateReadBoundary() throws Exception {
        mvc.perform(get(PATH)).andExpect(status().isUnauthorized());
        var customer = JwtTestClient.authenticated(tokens, account(UserAccount.Role.CUSTOMER));
        mvc.perform(get(PATH).with(customer)).andExpect(status().isForbidden());
        mvc.perform(post(PATH + "/read").with(customer).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"throughId\":0}")).andExpect(status().isForbidden());
        mvc.perform(post(PATH + "/read").with(JwtTestClient.authenticated(tokens, admin)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"throughId\":-1}"))
                .andExpect(status().isBadRequest());
        assertEquals(0, history(admin).path("unreadCount").asLong());
        assertTrue(history(admin).path("latestId").isNull());
    }

    @Test void backupSwitchCreatesANewNotificationAndExactRepeatsAreDeduplicated() throws Exception {
        monitor.record(config.getId(), "USING_BACKUP", "AI_PROVIDER_RATE_LIMIT", null, "Backup One");
        monitor.record(config.getId(), "USING_BACKUP", "AI_PROVIDER_RATE_LIMIT", null, "Backup Two");
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> assertEquals(2, alerts.count()));
        assertEquals("Backup Two", monitor.current().orElseThrow().backupKeyName());
        var items = history(admin).path("items");
        assertEquals("Backup Two", items.get(0).path("backupKeyName").asText());
        assertEquals("Backup One", items.get(1).path("backupKeyName").asText());
        monitor.record(config.getId(), "USING_BACKUP", "AI_PROVIDER_RATE_LIMIT", null, "Backup Two");
        monitor.record(config.getId(), "PRIMARY", null, null);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> assertTrue(monitor.current().isEmpty()));
        assertEquals(3, alerts.count());
    }

    @Test void backupAttemptOutcomesPersistIndependentlyFromChatRollbackAndRecover() {
        var key = backupKeys.saveAndFlush(new AiBackupKey(config.getId(), "Backup One", 1, "cipher", "masked"));
        assertThrows(IllegalStateException.class, () -> new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            monitor.recordBackupAttempt(key.getId(), "AI_PROVIDER_AUTH_ERROR");
            throw new IllegalStateException("chat rollback");
        }));
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            var recorded = backupKeys.findById(key.getId()).orElseThrow();
            assertEquals("KEY_ERROR", recorded.getLastStatus());
            assertEquals("AI_PROVIDER_AUTH_ERROR", recorded.getLastFailureReason());
            assertNotNull(recorded.getLastCheckedAt());
        });
        monitor.recordBackupAttempt(key.getId(), "AI_PROVIDER_BUSY");
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() ->
                assertEquals("PROVIDER_ERROR", backupKeys.findById(key.getId()).orElseThrow().getLastStatus()));
        monitor.recordBackupAttempt(key.getId(), null);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> {
            var recorded = backupKeys.findById(key.getId()).orElseThrow();
            assertEquals("WORKING", recorded.getLastStatus());
            assertNull(recorded.getLastFailureReason());
        });
    }

    private UserAccount account(UserAccount.Role role) {
        var user = UserAccount.invitedAccount(UUID.randomUUID() + "@example.test", "Notification Admin", role);
        user.activate();
        return users.saveAndFlush(user);
    }

    private AiProviderConfig configuration(String provider, boolean active) {
        var value = new AiProviderConfig(provider, "notification-model", "private-key-cipher", null, Instant.now());
        value.setActive(active);
        return configs.saveAndFlush(value);
    }

    private AiKeyAlert alert(AiProviderConfig value, String state) {
        return alerts.saveAndFlush(new AiKeyAlert(value.getId(), state, "AI_PROVIDER_RATE_LIMIT", null, Instant.now()));
    }

    private JsonNode history(UserAccount user) throws Exception {
        var result = mvc.perform(get(PATH).with(JwtTestClient.authenticated(tokens, user)))
                .andExpect(status().isOk()).andReturn();
        return json.readTree(result.getResponse().getContentAsString());
    }

    private void markRead(UserAccount user, long throughId) throws Exception {
        mvc.perform(post(PATH + "/read").with(JwtTestClient.authenticated(tokens, user)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"throughId\":" + throughId + "}"))
                .andExpect(status().isNoContent());
    }

    private void markReadAuthenticated(long throughId) throws Exception {
        var auth = UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(admin.getId()), null,
                java.util.List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        mvc.perform(post(PATH + "/read").with(authentication(auth)).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"throughId\":" + throughId + "}"))
                .andExpect(status().isNoContent());
    }
}
