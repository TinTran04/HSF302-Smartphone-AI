package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.request.OrderPreviewRequest;
import com.smartphoneai.dto.request.PlaceOrderRequest;
import com.smartphoneai.dto.request.ShippingInfo;
import com.smartphoneai.dto.request.UpdateProfileRequest;
import com.smartphoneai.dto.request.CartItemRequest;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AdminInvitationSender;
import com.smartphoneai.service.AdminManagementService;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.OrderService;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.service.UserService;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:accountstatus;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=status-owner@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AccountStatusIntegrationTest {
    private static final String PASSWORD = "AccountPassword123!";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired OtpChallengeRepository challenges;
    @Autowired ProductRepository products;
    @Autowired PasswordEncoder passwords;
    @Autowired JdbcTemplate jdbc;
    @Autowired CartService carts;
    @Autowired OrderService orders;
    @Autowired UserService profiles;
    @Autowired AdminManagementService admins;
    @Autowired PlatformTransactionManager transactions;
    @MockitoBean OtpSender otpSender;
    @MockitoBean AdminInvitationSender invitationSender;

    @ParameterizedTest
    @ValueSource(strings = {"CUSTOMER", "ADMIN"})
    void disableAndReenablePreserveAccountAndRevokeEveryPriorSession(String role) throws Exception {
        var target = account(role);
        var root = rootSession();
        var old = login(target, PASSWORD, 200);
        var secondOld = login(target, PASSWORD, 200);
        long before = target.getCredentialVersion();
        changeStatus(root, target, false, 200).andExpect(jsonPath("$.disabled").value(true))
                .andExpect(jsonPath("$.active").value(true)).andExpect(jsonPath("$.user.role").value(role));
        long disabledVersion = users.findById(target.getId()).orElseThrow().getCredentialVersion();
        assertTrue(disabledVersion > before);
        changeStatus(root, target, false, 200);
        assertEquals(disabledVersion, users.findById(target.getId()).orElseThrow().getCredentialVersion());
        login(target, "WrongPassword123!", 401);
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(target.getEmail(), PASSWORD)))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("ACCOUNT_DISABLED"));
        mvc.perform(get("/api/users/me").with(old)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/accounts").with(root)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.user.email == '" + target.getEmail() + "')].disabled").value(true));
        changeStatus(root, target, true, 200).andExpect(jsonPath("$.disabled").value(false))
                .andExpect(jsonPath("$.active").value(true));
        long enabledVersion = users.findById(target.getId()).orElseThrow().getCredentialVersion();
        assertTrue(enabledVersion > disabledVersion);
        changeStatus(root, target, true, 200);
        assertEquals(enabledVersion, users.findById(target.getId()).orElseThrow().getCredentialVersion());
        mvc.perform(get("/api/users/me").with(secondOld)).andExpect(status().isUnauthorized());
        var fresh = login(target, PASSWORD, 200);
        mvc.perform(get("/api/users/me").with(fresh)).andExpect(status().isOk());
        var restored = users.findById(target.getId()).orElseThrow();
        assertEquals(target.getFullName(), restored.getFullName());
        assertEquals(target.getPasswordHash(), restored.getPasswordHash());
        assertFalse(restored.isDeleted());
        verifyNoInteractions(otpSender);
    }

    @Test void disabledFlagInvalidatesASessionEvenWhenCredentialVersionMatches() throws Exception {
        var target = account("CUSTOMER");
        var session = login(target, PASSWORD, 200);
        jdbc.update("update users set disabled = true where id = ?", target.getId());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isUnauthorized());
    }

    @Test void ordinaryAdminCanManageOtherAccountsWithRootSelfDeletedAndInputGuards() throws Exception {
        var actor = account("ADMIN");
        var session = login(actor, PASSWORD, 200);
        var customer = account("CUSTOMER");
        var admin = account("ADMIN");
        changeStatus(session, customer, false, 200);
        changeStatus(session, customer, true, 200);
        changeStatus(session, admin, false, 200);
        changeStatus(session, admin, true, 200);
        var root = users.findByRootKey("ROOT").orElseThrow();
        changeStatus(session, root, false, 403);
        changeStatus(session, actor, false, 403);
        var deleted = account("ADMIN");
        deleted.disableAndDelete();
        users.saveAndFlush(deleted);
        changeStatus(session, deleted, true, 403);
        mvc.perform(patch("/api/admin/accounts/{id}/status", UUID.randomUUID()).with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":false}"))
                .andExpect(status().isForbidden());
        for (String body : List.of("{}", "{\"enabled\":null}", "{\"enabled\":\"invalid\"}")) {
            mvc.perform(patch("/api/admin/accounts/{id}/status", customer.getId()).with(session).with(csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        }
        mvc.perform(patch("/api/admin/accounts/{id}/status", customer.getId()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":false}"))
                .andExpect(status().isUnauthorized());
        changeStatus(login(customer, PASSWORD, 200), admin, false, 403);
        assertTrue(users.findById(root.getId()).orElseThrow().isActive());
        assertTrue(users.findById(actor.getId()).orElseThrow().isActive());
    }

    @Test void disabledRegistrationCannotResumeLoginOrConsumeOtpAndReenableRetainsPendingState() throws Exception {
        var code = captureOtp();
        String email = UUID.randomUUID() + "@example.com";
        var response = mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", email, "password", PASSWORD,
                                "fullName", "Pending", "phone", "0900000000"))))
                .andExpect(status().isAccepted()).andReturn();
        String challenge = mapper.readTree(response.getResponse().getContentAsString()).path("challengeId").asText();
        String originalCode = code.get();
        var target = users.findByEmail(email).orElseThrow();
        var root = rootSession();
        changeStatus(root, target, false, 200).andExpect(jsonPath("$.active").value(false));
        login(target, PASSWORD, 403);
        verifyRegistration(challenge, originalCode, 409);
        assertFalse(users.findById(target.getId()).orElseThrow().isActive());
        changeStatus(root, target, true, 200).andExpect(jsonPath("$.active").value(false));
        verifyRegistration(challenge, originalCode, 200);
        assertTrue(users.findById(target.getId()).orElseThrow().isActive());
    }

    @ParameterizedTest
    @ValueSource(strings = {"CUSTOMER", "ADMIN"})
    void disabledInvitationCannotAcceptOrResendAndReenableRetainsPendingState(String role) throws Exception {
        var token = new AtomicReference<String>();
        doAnswer(invocation -> { token.set(invocation.getArgument(1)); return null; })
                .when(invitationSender).send(anyString(), anyString());
        var root = rootSession();
        String email = UUID.randomUUID() + "@example.com";
        var response = mvc.perform(post("/api/admin/account-invitations").with(root).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(
                                Map.of("email", email, "fullName", "Invited", "role", role))))
                .andExpect(status().isAccepted()).andReturn();
        String invitationId = mapper.readTree(response.getResponse().getContentAsString()).path("id").asText();
        String originalToken = token.get();
        var target = users.findByEmail(email).orElseThrow();
        changeStatus(root, target, false, 200).andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.invitationId").value(invitationId));
        mvc.perform(post("/api/admin/account-invitations/{id}/resend", invitationId).with(root).with(csrf()))
                .andExpect(status().isConflict());
        acceptInvitation(originalToken, 409);
        assertFalse(users.findById(target.getId()).orElseThrow().isActive());
        assertEquals("!", users.findById(target.getId()).orElseThrow().getPasswordHash());
        changeStatus(root, target, true, 200).andExpect(jsonPath("$.active").value(false));
        acceptInvitation(originalToken, 204);
        login(target, PASSWORD, 200);
    }

    @Test void disabledPasswordResetDoesNotSendMailOrChangePasswordIncludingPreissuedChallenges() throws Exception {
        var target = account("CUSTOMER");
        var code = captureOtp();
        String originalHash = target.getPasswordHash();
        String preissued = beginReset(target.getEmail());
        String originalCode = code.get();
        var root = rootSession();
        changeStatus(root, target, false, 200);
        confirmReset(preissued, originalCode, 409);
        assertEquals(originalHash, users.findById(target.getId()).orElseThrow().getPasswordHash());
        jdbc.update("update otp_challenges set issued_at = ? where id = ?",
                Timestamp.from(Instant.now().minusSeconds(61)), UUID.fromString(preissued));
        clearInvocations(otpSender);
        String lockedChallenge = beginReset(target.getEmail());
        verifyNoInteractions(otpSender);
        assertFalse(challenges.findById(UUID.fromString(lockedChallenge)).orElseThrow().isDeliverable());
        changeStatus(root, target, true, 200);
        confirmReset(lockedChallenge, "123456", 409);
        login(target, PASSWORD, 200);
    }

    @Test void disabledCustomerCannotMutateRetainedCartOrdersOrProfileAfterPassingTheHttpFilter() throws Exception {
        var target = account("CUSTOMER");
        var product = new Product();
        product.setName("Retained phone");
        product.setActive(true);
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("128GB");
        variant.setPrice(10000000L);
        variant.setActive(true);
        product.addVariant(variant);
        products.saveAndFlush(product);
        carts.add(target.getId(), variant.getId(), 2);
        var shipping = new ShippingInfo("Customer", "0900000000", "Address", "");
        var preview = orders.preview(target.getId(), new OrderPreviewRequest(List.of(variant.getId()), shipping, "COD"));
        var placed = orders.place(target.getId(), UUID.randomUUID().toString(),
                new PlaceOrderRequest(UUID.fromString(preview.previewId()), shipping, "COD"));
        carts.add(target.getId(), variant.getId(), 3);
        changeStatus(rootSession(), target, false, 200);
        assertThrows(InvalidCredentialsException.class, () -> carts.add(target.getId(), variant.getId(), 1));
        assertThrows(InvalidCredentialsException.class, () -> carts.update(target.getId(), variant.getId(), 1));
        assertThrows(InvalidCredentialsException.class, () -> carts.remove(target.getId(), variant.getId()));
        assertThrows(InvalidCredentialsException.class, () -> carts.merge(target.getId(),
                List.of(new CartItemRequest(variant.getId(), 1)), UUID.randomUUID()));
        assertThrows(InvalidCredentialsException.class, () -> orders.preview(target.getId(),
                new OrderPreviewRequest(List.of(variant.getId()), shipping, "COD")));
        assertThrows(InvalidCredentialsException.class, () -> orders.cancel(target.getId(), UUID.fromString(placed.id())));
        assertThrows(InvalidCredentialsException.class, () -> orders.place(target.getId(), UUID.randomUUID().toString(),
                new PlaceOrderRequest(UUID.fromString(preview.previewId()), shipping, "COD")));
        assertThrows(InvalidCredentialsException.class, () -> profiles.updateProfile(target.getId().toString(),
                new UpdateProfileRequest("Changed", "0911111111", "Changed")));
        assertThrows(InvalidCredentialsException.class, () -> profiles.changePassword(target.getId().toString(), PASSWORD, "NewPassword123!"));
        assertTrue(profiles.findActiveUser(target.getId().toString()).isEmpty());
        assertEquals(3, carts.get(target.getId()).items().getFirst().quantity());
        assertEquals("PENDING", orders.get(target.getId(), UUID.fromString(placed.id())).status());
        assertEquals(target.getFullName(), users.findById(target.getId()).orElseThrow().getFullName());
    }

    @Test void queuedProfileMutationIsRejectedAfterDisableCommits() throws Exception {
        var target = account("CUSTOMER");
        var actor = users.findByRootKey("ROOT").orElseThrow();
        var locked = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        var mutationStarted = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var disable = executor.submit(() -> new TransactionTemplate(transactions).executeWithoutResult(status -> {
                admins.changeStatus(actor.getId(), target.getId(), false);
                locked.countDown();
                try {
                    assertTrue(release.await(10, TimeUnit.SECONDS));
                } catch (InterruptedException exception) {
                    Thread.currentThread().interrupt();
                    throw new AssertionError(exception);
                }
            }));
            try {
                assertTrue(locked.await(10, TimeUnit.SECONDS));
                var mutation = executor.submit(() -> {
                    mutationStarted.countDown();
                    return assertThrows(InvalidCredentialsException.class, () -> profiles.updateProfile(target.getId().toString(),
                            new UpdateProfileRequest("Queued change", "0911111111", "Queued address")));
                });
                assertTrue(mutationStarted.await(10, TimeUnit.SECONDS));
                assertThrows(TimeoutException.class, () -> mutation.get(100, TimeUnit.MILLISECONDS));
                release.countDown();
                disable.get(10, TimeUnit.SECONDS);
                mutation.get(10, TimeUnit.SECONDS);
            } finally {
                release.countDown();
            }
        }
        assertEquals(target.getFullName(), users.findById(target.getId()).orElseThrow().getFullName());
    }

    private UserAccount account(String role) {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Account", "0900000000", passwords.encode(PASSWORD));
        user.changeRole(UserAccount.Role.valueOf(role));
        user.activate();
        return users.saveAndFlush(user);
    }

    private JwtTestClient rootSession() throws Exception {
        return login(users.findByRootKey("ROOT").orElseThrow(), "TestRootPassword123!", 200);
    }

    private JwtTestClient login(UserAccount user, String password, int expectedStatus) throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(user.getEmail(), password))).andExpect(status().is(expectedStatus));
        return session;
    }

    private String loginBody(String email, String password) throws Exception {
        return mapper.writeValueAsString(Map.of("identifier", email, "password", password));
    }

    private ResultActions changeStatus(JwtTestClient actor, UserAccount target, boolean enabled, int expectedStatus) throws Exception {
        return mvc.perform(patch("/api/admin/accounts/{id}/status", target.getId()).with(actor).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("enabled", enabled))))
                .andExpect(status().is(expectedStatus));
    }

    private AtomicReference<String> captureOtp() {
        var code = new AtomicReference<String>();
        doAnswer(invocation -> { code.set(invocation.getArgument(1)); return null; })
                .when(otpSender).send(anyString(), anyString());
        return code;
    }

    private void verifyRegistration(String id, String code, int expectedStatus) throws Exception {
        mvc.perform(post("/api/auth/otp/verify").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", id, "code", code))))
                .andExpect(status().is(expectedStatus));
    }

    private void acceptInvitation(String token, int expectedStatus) throws Exception {
        mvc.perform(post("/api/auth/account-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("token", token, "password", PASSWORD))))
                .andExpect(status().is(expectedStatus));
    }

    private String beginReset(String email) throws Exception {
        var response = mvc.perform(post("/api/auth/password-reset").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isAccepted()).andReturn();
        return mapper.readTree(response.getResponse().getContentAsString()).path("challengeId").asText();
    }

    private void confirmReset(String id, String code, int expectedStatus) throws Exception {
        mvc.perform(post("/api/auth/password-reset/confirm").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", id, "code", code, "newPassword", "NewPassword123!"))))
                .andExpect(status().is(expectedStatus));
    }
}
