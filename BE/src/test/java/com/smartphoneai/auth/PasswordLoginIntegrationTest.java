package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.request.CartItemRequest;
import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.LoginService;
import com.smartphoneai.service.OtpSender;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
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
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:passwordlogin;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class PasswordLoginIntegrationTest {
    private static final String PASSWORD = "Password123!";
    private static final String NEW_PASSWORD = "ChangedPassword123!";
    @Autowired MockMvc mvc;
    @Autowired com.smartphoneai.service.AuthTokenService tokens;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired OtpChallengeRepository challenges;
    @Autowired ProductRepository products;
    @Autowired CartService carts;
    @Autowired LoginService login;
    @Autowired PasswordEncoder passwords;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean OtpSender sender;

    @Test void activeCustomerLogsInDirectlyWithoutIssuingOtp() throws Exception {
        var user = customer();
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", " " + user.getEmail().toUpperCase() + " ", "password", PASSWORD))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.mergedConversationIds").isEmpty()).andExpect(jsonPath("$.challengeId").doesNotExist());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isOk());
        assertEquals(0, jdbc.queryForObject("select count(*) from otp_challenges where email = ?", Integer.class, user.getEmail()));
        verifyNoInteractions(sender);
    }

    @Test void customerLoginMergesGuestCartAndChatBeforeEstablishingSession() throws Exception {
        var user = customer();
        var variant = variant();
        carts.add(user.getId(), variant.getId(), 3);
        var guest = guestConversation();
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).header("X-Guest-Session", guest.token()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody(user, variant.getId(), 2)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mergedConversationIds[0]").value(guest.conversationId().toString()));
        mvc.perform(get("/api/cart").with(session)).andExpect(status().isOk()).andExpect(jsonPath("$.items[0].quantity").value(5));
        assertEquals(user.getId(), jdbc.queryForObject("select user_id from ai_conversations where id = ?", UUID.class, guest.conversationId()));
        assertTrue(jdbc.queryForObject("select revoked from ai_guest_sessions where id = ?", Boolean.class, guest.guestId()));
    }

    @Test void existingLoginServiceEntryPointRetainsTransactionalCartMerge() {
        var user = customer();
        var variant = variant();
        var result = login.beginLogin(new LoginRequest(user.getEmail(), PASSWORD, List.of(new CartItemRequest(variant.getId(), 2))));
        assertEquals(user.getId(), result.user().getId());
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void repeatedLoginAppliesTheSameGuestCartMergeOnlyOnce() throws Exception {
        var user = customer();
        var variant = variant();
        var mergeId = UUID.randomUUID();
        var body = retryLoginBody(user, variant.getId(), 2, mergeId);
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(user, variant.getId(), 2, UUID.randomUUID()))).andExpect(status().isOk());
        assertEquals(4, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void mergeKeyCannotBeReusedWithAnotherCartPayload() throws Exception {
        var user = customer();
        var variant = variant();
        var mergeId = UUID.randomUUID();
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(user, variant.getId(), 2, mergeId))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(user, variant.getId(), 3, mergeId))).andExpect(status().isConflict());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD,
                                "guestCart", List.of(), "guestCartMergeId", mergeId)))).andExpect(status().isConflict());
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void mergeKeyCannotBeReusedByAnotherAccount() throws Exception {
        var first = customer();
        var second = customer();
        var variant = variant();
        var mergeId = UUID.randomUUID();
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(first, variant.getId(), 2, mergeId))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(second, variant.getId(), 2, mergeId))).andExpect(status().isConflict());
        assertEquals(2, carts.get(first.getId()).items().getFirst().quantity());
        assertTrue(carts.get(second.getId()).items().isEmpty());
    }

    @Test void emptyGuestCartStillBindsAnExplicitMergeKey() throws Exception {
        var user = customer();
        var mergeId = UUID.randomUUID();
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD,
                                "guestCart", List.of(), "guestCartMergeId", mergeId)))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(user, variant().getId(), 2, mergeId))).andExpect(status().isConflict());
        assertTrue(carts.get(user.getId()).items().isEmpty());
    }

    @Test void failedChatClaimDoesNotConsumeTheGuestCartMergeKey() throws Exception {
        var user = customer();
        var variant = variant();
        var body = retryLoginBody(user, variant.getId(), 2, UUID.randomUUID());
        mvc.perform(post("/api/auth/login").header("X-Guest-Session", "invalid").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized());
        assertTrue(carts.get(user.getId()).items().isEmpty());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void passwordLoginAfterRegistrationResponseLossDoesNotMergeTheCartAgain() throws Exception {
        var email = UUID.randomUUID() + "@example.com";
        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var registration = mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", email, "password", PASSWORD, "fullName", "Customer", "phone", "0900000000"))))
                .andExpect(status().isAccepted()).andReturn();
        var challengeId = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        var variant = variant();
        var mergeId = UUID.randomUUID();
        mvc.perform(post("/api/auth/otp/verify").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("challengeId", challengeId, "code", code.get(),
                                "guestCart", List.of(Map.of("variantId", variant.getId(), "quantity", 2)), "guestCartMergeId", mergeId))))
                .andExpect(status().isOk());
        var user = users.findByEmail(email).orElseThrow();
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(retryLoginBody(user, variant.getId(), 2, mergeId))).andExpect(status().isOk());
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void concurrentLoginRetriesMergeTheCartOnlyOnce() throws Exception {
        var user = customer();
        var variant = variant();
        var body = retryLoginBody(user, variant.getId(), 2, UUID.randomUUID());
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var request = (java.util.concurrent.Callable<Integer>) () -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body))
                        .andReturn().getResponse().getStatus();
            };
            var first = executor.submit(request);
            var second = executor.submit(request);
            start.countDown();
            assertEquals(200, first.get(15, TimeUnit.SECONDS));
            assertEquals(200, second.get(15, TimeUnit.SECONDS));
        }
        assertEquals(2, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void concurrentAccountsCannotClaimTheSameMergeKey() throws Exception {
        var firstUser = customer();
        var secondUser = customer();
        var variant = variant();
        var mergeId = UUID.randomUUID();
        var firstBody = retryLoginBody(firstUser, variant.getId(), 2, mergeId);
        var secondBody = retryLoginBody(secondUser, variant.getId(), 2, mergeId);
        var start = new CountDownLatch(1);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(firstBody))
                        .andReturn().getResponse().getStatus();
            });
            var second = executor.submit(() -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(secondBody))
                        .andReturn().getResponse().getStatus();
            });
            start.countDown();
            var statuses = List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS)).stream().sorted().toList();
            assertEquals(List.of(200, 409), statuses);
        }
        int firstQuantity = carts.get(firstUser.getId()).items().stream().mapToInt(item -> item.quantity()).sum();
        int secondQuantity = carts.get(secondUser.getId()).items().stream().mapToInt(item -> item.quantity()).sum();
        assertEquals(2, firstQuantity + secondQuantity);
    }

    @Test void reorderedGuestCartItemsRetainTheSameMergePayload() throws Exception {
        var user = customer();
        var firstVariant = variant();
        var secondVariant = variant();
        var items = List.of(Map.of("variantId", firstVariant.getId(), "quantity", 2), Map.of("variantId", secondVariant.getId(), "quantity", 3));
        var body = new java.util.HashMap<String, Object>(Map.of("identifier", user.getEmail(), "password", PASSWORD,
                "guestCartMergeId", UUID.randomUUID()));
        body.put("guestCart", items);
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body))).andExpect(status().isOk());
        body.put("guestCart", items.reversed());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body))).andExpect(status().isOk());
        assertEquals(5, carts.get(user.getId()).items().stream().mapToInt(item -> item.quantity()).sum());
    }

    @Test void failedChatClaimRollsBackCartAndDoesNotAuthenticateBeforeRetry() throws Exception {
        var user = customer();
        var variant = variant();
        carts.add(user.getId(), variant.getId(), 3);
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).header("X-Guest-Session", "invalid").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody(user, variant.getId(), 2)))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isUnauthorized());
        assertEquals(3, carts.get(user.getId()).items().getFirst().quantity());
        var guest = guestConversation();
        mvc.perform(post("/api/auth/login").with(session).header("X-Guest-Session", guest.token()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody(user, variant.getId(), 2)))
                .andExpect(status().isOk());
        assertEquals(5, carts.get(user.getId()).items().getFirst().quantity());
    }

    @Test void invalidPasswordDoesNotMergeGuestState() throws Exception {
        var user = customer();
        var variant = variant();
        var guest = guestConversation();
        mvc.perform(post("/api/auth/login").header("X-Guest-Session", guest.token()).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody(user, variant.getId(), 2).replace(PASSWORD, "WrongPassword123!")))
                .andExpect(status().isUnauthorized());
        assertTrue(carts.get(user.getId()).items().isEmpty());
        assertFalse(jdbc.queryForObject("select revoked from ai_guest_sessions where id = ?", Boolean.class, guest.guestId()));
        assertNull(jdbc.queryForObject("select user_id from ai_conversations where id = ?", UUID.class, guest.conversationId()));
    }

    @Test void adminLoginPreservesGuestDataForCustomerLogin() throws Exception {
        var admin = UserAccount.invitedAdmin(UUID.randomUUID() + "@example.com", "Admin");
        admin.changePasswordHash(passwords.encode(PASSWORD));
        admin.activate();
        admin = users.saveAndFlush(admin);
        var guest = guestConversation();
        mvc.perform(post("/api/auth/login").header("X-Guest-Session", guest.token()).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(admin, variant().getId(), 2)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mergedConversationIds").isEmpty());
        assertTrue(carts.get(admin.getId()).items().isEmpty());
        assertFalse(jdbc.queryForObject("select revoked from ai_guest_sessions where id = ?", Boolean.class, guest.guestId()));
        assertNull(jdbc.queryForObject("select user_id from ai_conversations where id = ?", UUID.class, guest.conversationId()));
        verifyNoInteractions(sender);
    }

    @Test void loginValidatesNestedCartQuantities() throws Exception {
        var user = customer();
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user, variant().getId(), 0)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test void legacyLoginOtpCannotAuthenticateOrResend() throws Exception {
        var user = customer();
        var challenge = challenges.saveAndFlush(new OtpChallenge(user.getEmail(), "LOGIN", passwords.encode("123456"), Instant.now().minusSeconds(61)));
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/otp/verify").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("challengeId", challenge.getId(), "code", "123456"))))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/otp/resend").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("challengeId", challenge.getId()))))
                .andExpect(status().isTooManyRequests());
        verifyNoInteractions(sender);
    }

    @Test void passwordChangeRetainsOnlyTheCurrentSessionAndNewLogins() throws Exception {
        var user = customer();
        var current = session(user);
        var other = session(user);
        mvc.perform(post("/api/users/me/password").with(current).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("currentPassword", PASSWORD, "newPassword", NEW_PASSWORD))))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").with(current)).andExpect(status().isOk());
        mvc.perform(get("/api/users/me").with(other)).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD))))
                .andExpect(status().isUnauthorized());
        var fresh = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(fresh).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", NEW_PASSWORD))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/users/me").with(fresh)).andExpect(status().isOk());
    }

    @Test void failedPasswordChangeAndProfileEditKeepOtherSessionsValid() throws Exception {
        var user = customer();
        var current = session(user);
        var other = session(user);
        mvc.perform(post("/api/users/me/password").with(current).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("currentPassword", "WrongPassword123!", "newPassword", NEW_PASSWORD))))
                .andExpect(status().isUnauthorized());
        mvc.perform(put("/api/users/me").with(current).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated\",\"phone\":\"0900000000\",\"address\":\"Address\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/users/me").with(other)).andExpect(status().isOk()).andExpect(jsonPath("$.fullName").value("Updated"));
    }

    @Test void passwordResetRevokesEveryOldSessionIncludingTheRequestingSession() throws Exception {
        var user = customer();
        var current = session(user);
        var other = session(user);
        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var response = mvc.perform(post("/api/auth/password-reset").with(current).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("email", user.getEmail()))))
                .andExpect(status().isAccepted()).andReturn();
        var challengeId = mapper.readTree(response.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/password-reset/confirm").with(current).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("challengeId", challengeId, "code", code.get(), "newPassword", NEW_PASSWORD))))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").with(current)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").with(other)).andExpect(status().isUnauthorized());
    }

    @Test void roleChangeAndDeletionRevokeExistingSessions() throws Exception {
        var user = customer();
        var beforeRoleChange = session(user);
        user.changeRole(UserAccount.Role.ADMIN);
        user = users.saveAndFlush(user);
        mvc.perform(get("/api/users/me").with(beforeRoleChange)).andExpect(status().isUnauthorized());
        var beforeDeletion = session(users.findById(user.getId()).orElseThrow());
        user.disableAndDelete();
        users.saveAndFlush(user);
        mvc.perform(get("/api/users/me").with(beforeDeletion)).andExpect(status().isUnauthorized());
    }

    @Test void restoringThePriorRoleDoesNotRestoreAnOldSession() throws Exception {
        var user = customer();
        var stale = session(user);
        user.changeRole(UserAccount.Role.ADMIN);
        user = users.saveAndFlush(user);
        user.changeRole(UserAccount.Role.CUSTOMER);
        users.saveAndFlush(user);
        mvc.perform(get("/api/users/me").with(stale)).andExpect(status().isUnauthorized());
    }

    private UserAccount customer() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Customer", "0900000000", passwords.encode(PASSWORD));
        user.activate();
        return users.saveAndFlush(user);
    }

    private ProductVariant variant() {
        var product = new Product();
        product.setName("Login phone");
        product.setActive(true);
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("128GB");
        variant.setPrice(10000000L);
        variant.setActive(true);
        product.addVariant(variant);
        products.saveAndFlush(product);
        return variant;
    }

    private String loginBody(UserAccount user, Long variantId, int quantity) throws Exception {
        return mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD,
                "guestCart", List.of(Map.of("variantId", variantId, "quantity", quantity))));
    }

    private String retryLoginBody(UserAccount user, Long variantId, int quantity, UUID mergeId) throws Exception {
        return mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD,
                "guestCart", List.of(Map.of("variantId", variantId, "quantity", quantity)), "guestCartMergeId", mergeId));
    }

    private JwtTestClient session(UserAccount user) {
        return JwtTestClient.authenticated(tokens, user);
    }

    private record Guest(String token, UUID guestId, UUID conversationId) {}

    private Guest guestConversation() throws Exception {
        var token = UUID.randomUUID().toString().replace("-", "").repeat(2);
        var hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        var guestId = UUID.randomUUID();
        var conversationId = UUID.randomUUID();
        var now = Instant.now();
        jdbc.update("insert into ai_guest_sessions(id,token_hash,created_at,expires_at) values(?,?,?,?)",
                guestId, hash, Timestamp.from(now), Timestamp.from(now.plusSeconds(3600)));
        jdbc.update("insert into ai_conversations(id,guest_id,topic,title,created_at,product_ids) values(?,?,?,?,?,?)",
                conversationId, guestId, "PHONE_CONSULTATION", "Guest chat", Timestamp.from(now), "[]");
        jdbc.update("insert into ai_messages(conversation_id,role,content,sources_json,recommendations_json,comparisons_json,created_at) values(?,?,?,?,?,?,?)",
                conversationId, "user", "Hello", "[]", "[]", "[]", Timestamp.from(now));
        return new Guest(token, guestId, conversationId);
    }
}
