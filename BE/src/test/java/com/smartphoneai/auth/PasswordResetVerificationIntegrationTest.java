package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.OtpSender;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:resetverification;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=reset-owner@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class PasswordResetVerificationIntegrationTest {
    private static final String OLD_PASSWORD = "OldPassword123!";
    private static final String NEW_PASSWORD = "NewPassword123!";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean OtpSender sender;
    private final AtomicReference<String> sent = new AtomicReference<>();
    private UserAccount user;

    @BeforeEach void prepare() {
        doAnswer(invocation -> { sent.set(invocation.getArgument(1)); return null; })
                .when(sender).send(anyString(), anyString());
        user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Reset", "0900000000", passwords.encode(OLD_PASSWORD));
        user.activate();
        users.saveAndFlush(user);
    }

    @Test void verifiesOtpBeforeAcceptingASingleUsePasswordResetToken() throws Exception {
        String id = begin(user.getEmail());
        confirm(id, "unverified-token").andExpect(status().isConflict());
        verify(id, "000000".equals(sent.get()) ? "111111" : "000000").andExpect(status().isConflict());
        assertOldPassword();
        String token = verifiedToken(id);
        assertOldPassword();
        assertNotEquals(token, jdbc.queryForObject("select reset_token_hash from otp_challenges where id = ?", String.class, UUID.fromString(id)));
        verify(id, sent.get()).andExpect(status().isConflict());
        confirm(id, "incorrect-token").andExpect(status().isConflict());
        confirm(id, "ấ".repeat(40)).andExpect(status().isConflict());
        confirm(id, token).andExpect(status().isNoContent());
        assertTrue(passwords.matches(NEW_PASSWORD, users.findById(user.getId()).orElseThrow().getPasswordHash()));
        confirm(id, token).andExpect(status().isConflict());
    }

    @Test void refusesOtpAsProofAtThePasswordUpdateEndpoint() throws Exception {
        String id = begin(user.getEmail());
        postJson("/api/auth/password-reset/confirm", Map.of("challengeId", id, "code", sent.get(), "newPassword", NEW_PASSWORD))
                .andExpect(status().isBadRequest());
        assertOldPassword();
    }

    @Test void rejectsExpiredResetAuthorization() throws Exception {
        String id = begin(user.getEmail());
        String token = verifiedToken(id);
        jdbc.update("update otp_challenges set reset_expires_at = ? where id = ?", Timestamp.from(Instant.now().minusSeconds(1)), UUID.fromString(id));
        confirm(id, token).andExpect(status().isConflict());
        assertOldPassword();
    }

    @Test void cannotReuseAuthorizationAfterCredentialsChange() throws Exception {
        String id = begin(user.getEmail());
        String token = verifiedToken(id);
        var changed = users.findById(user.getId()).orElseThrow();
        changed.changePasswordHash(passwords.encode("ChangedPassword123!"));
        users.saveAndFlush(changed);
        confirm(id, token).andExpect(status().isConflict());
        assertTrue(passwords.matches("ChangedPassword123!", users.findById(user.getId()).orElseThrow().getPasswordHash()));
    }

    @Test void requestingAnotherOtpRevokesAnEarlierVerifiedReset() throws Exception {
        String firstId = begin(user.getEmail());
        String token = verifiedToken(firstId);
        jdbc.update("update otp_challenges set issued_at = ? where id = ?", Timestamp.from(Instant.now().minusSeconds(61)), UUID.fromString(firstId));
        String secondId = begin(user.getEmail());
        assertNotEquals(firstId, secondId);
        confirm(firstId, token).andExpect(status().isConflict());
        confirm(secondId, token).andExpect(status().isConflict());
        String replacement = verifiedToken(secondId);
        confirm(secondId, replacement).andExpect(status().isNoContent());
    }

    @Test void fiveWrongCodesBlockVerification() throws Exception {
        String id = begin(user.getEmail());
        String correct = sent.get();
        String incorrect = "000000".equals(correct) ? "111111" : "000000";
        for (int attempt = 0; attempt < 5; attempt++) verify(id, incorrect).andExpect(status().isConflict());
        verify(id, correct).andExpect(status().isConflict());
        assertOldPassword();
    }

    @Test void verificationRejectsExpiredOtpAndUnknownEmail() throws Exception {
        String id = begin(user.getEmail());
        jdbc.update("update otp_challenges set issued_at = ? where id = ?", Timestamp.from(Instant.now().minusSeconds(301)), UUID.fromString(id));
        verify(id, sent.get()).andExpect(status().isConflict());
        String unknown = begin(UUID.randomUUID() + "@example.com");
        verify(unknown, "123456").andExpect(status().isConflict());
        assertOldPassword();
    }

    @Test void disabledAccountCannotUseAnAlreadyVerifiedReset() throws Exception {
        String id = begin(user.getEmail());
        String token = verifiedToken(id);
        var disabled = users.findById(user.getId()).orElseThrow();
        disabled.changeEnabled(false);
        users.saveAndFlush(disabled);
        confirm(id, token).andExpect(status().isConflict());
        assertOldPassword();
    }

    @Test void passwordValidationDoesNotConsumeTheResetAuthorization() throws Exception {
        String id = begin(user.getEmail());
        String token = verifiedToken(id);
        postJson("/api/auth/password-reset/confirm", Map.of("challengeId", id, "resetToken", token, "newPassword", "short"))
                .andExpect(status().isBadRequest());
        confirm(id, token).andExpect(status().isNoContent());
    }

    @Test void simultaneousVerificationConsumesTheOtpOnlyOnce() throws Exception {
        String id = begin(user.getEmail());
        String code = sent.get();
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<Integer> request = () -> {
                assertTrue(start.await(5, TimeUnit.SECONDS));
                return verify(id, code).andReturn().getResponse().getStatus();
            };
            var first = executor.submit(request);
            var second = executor.submit(request);
            start.countDown();
            var statuses = new java.util.ArrayList<>(List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)));
            statuses.sort(Integer::compareTo);
            assertEquals(List.of(200, 409), statuses);
        }
    }

    @Test void simultaneousPasswordUpdatesConsumeAuthorizationOnlyOnce() throws Exception {
        String id = begin(user.getEmail());
        String token = verifiedToken(id);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<Integer> request = () -> {
                assertTrue(start.await(5, TimeUnit.SECONDS));
                return confirm(id, token).andReturn().getResponse().getStatus();
            };
            var first = executor.submit(request);
            var second = executor.submit(request);
            start.countDown();
            var statuses = new java.util.ArrayList<>(List.of(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)));
            statuses.sort(Integer::compareTo);
            assertEquals(List.of(204, 409), statuses);
        }
    }

    private String begin(String email) throws Exception {
        var response = postJson("/api/auth/password-reset", Map.of("email", email)).andExpect(status().isAccepted()).andReturn();
        return mapper.readTree(response.getResponse().getContentAsString()).path("challengeId").asText();
    }

    private ResultActions verify(String id, String code) throws Exception {
        return postJson("/api/auth/password-reset/verify", Map.of("challengeId", id, "code", code));
    }

    private String verifiedToken(String id) throws Exception {
        var response = verify(id, sent.get()).andExpect(status().isOk())
                .andExpect(jsonPath("$.expiresAt").isNotEmpty()).andReturn();
        String token = mapper.readTree(response.getResponse().getContentAsString()).path("resetToken").asText();
        assertTrue(token.length() >= 32);
        return token;
    }

    private ResultActions confirm(String id, String token) throws Exception {
        return postJson("/api/auth/password-reset/confirm", Map.of("challengeId", id, "resetToken", token, "newPassword", NEW_PASSWORD));
    }

    private ResultActions postJson(String path, Map<String, String> body) throws Exception {
        return mvc.perform(post(path).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(body)));
    }

    private void assertOldPassword() {
        assertTrue(passwords.matches(OLD_PASSWORD, users.findById(user.getId()).orElseThrow().getPasswordHash()));
    }
}
