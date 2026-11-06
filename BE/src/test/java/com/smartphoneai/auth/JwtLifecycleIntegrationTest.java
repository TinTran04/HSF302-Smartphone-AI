package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.controller.AuthController;
import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.service.MaintenanceService;
import java.util.HashMap;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import jakarta.servlet.http.Cookie;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:jwtlifecycle;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class JwtLifecycleIntegrationTest {
    private static final String PASSWORD = "Password123!";
    private static final Instant NOW = Instant.parse("2026-11-05T08:00:00Z");
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired PasswordEncoder passwords;
    @Autowired JdbcTemplate jdbc;
    @Autowired AuthController authController;
    @Autowired MaintenanceService maintenance;
    @MockitoSpyBean JwtEncoder encoder;
    @Autowired @Qualifier("jwtDecoder") JwtDecoder decoder;
    @MockitoBean Clock clock;

    @BeforeEach void currentTime() { when(clock.instant()).thenReturn(NOW); }

    @Test void loginUsesHttpOnlyJwtAndOpaqueRefreshCookiesWithoutCreatingSession() throws Exception {
        var response = login(customer());
        var access = cookie(response, "SPAI_ACCESS");
        var refresh = cookie(response, "SPAI_REFRESH");
        assertEquals(3, access.getValue().split("\\.").length);
        assertFalse(refresh.getValue().contains("."));
        assertEquals("/api", access.getPath());
        assertEquals("/api/auth", refresh.getPath());
        assertTrue(access.isHttpOnly());
        assertTrue(refresh.isHttpOnly());
        assertEquals("Strict", access.getAttribute("SameSite"));
        assertEquals("Strict", refresh.getAttribute("SameSite"));
        assertEquals(900, access.getMaxAge());
        assertEquals(604800, refresh.getMaxAge());
        assertFalse(access.getSecure());
        assertNull(response.getRequest().getSession(false));
        assertFalse(response.getResponse().getContentAsString().contains(access.getValue()));
        assertNotEquals(refresh.getValue(), jdbc.queryForObject("select token_hash from refresh_sessions where user_id = ?", String.class,
                UUID.fromString(mapper.readTree(response.getResponse().getContentAsString()).path("user").path("id").asText())));
        mvc.perform(get("/api/users/me").cookie(access)).andExpect(status().isOk());
    }

    @Test void serverSessionCannotAuthenticateEvenWithValidLegacyContext() throws Exception {
        var user = customer();
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(user.getId()), null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
        var session = new MockHttpSession();
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isUnauthorized());
    }

    @Test void accessExpiresAndRefreshRotatesOnceWithoutClearingNewCookiesOnReplay() throws Exception {
        var issued = login(customer());
        var oldRefresh = cookie(issued, "SPAI_REFRESH");
        when(clock.instant()).thenReturn(NOW.plusSeconds(901));
        mvc.perform(get("/api/users/me").cookie(cookie(issued, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
        var renewed = mvc.perform(post("/api/auth/refresh").cookie(oldRefresh).with(csrf()))
                .andExpect(status().isNoContent()).andReturn();
        assertNotEquals(oldRefresh.getValue(), cookie(renewed, "SPAI_REFRESH").getValue());
        mvc.perform(get("/api/users/me").cookie(cookie(renewed, "SPAI_ACCESS"))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/refresh").cookie(oldRefresh).with(csrf())).andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Set-Cookie"));
        mvc.perform(post("/api/auth/refresh").cookie(cookie(renewed, "SPAI_REFRESH")).with(csrf())).andExpect(status().isNoContent());
    }

    @Test void refreshRequiresCsrfAndRejectsWrongOrExpiredCredentials() throws Exception {
        var issued = login(customer());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH"))).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/refresh").cookie(new Cookie("SPAI_REFRESH", "wrong")).with(csrf())).andExpect(status().isUnauthorized());
        when(clock.instant()).thenReturn(NOW.plusSeconds(604801));
        mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH")).with(csrf())).andExpect(status().isUnauthorized());
    }

    @Test void concurrentRefreshHasOneWinnerAndItsCredentialsRemainUsable() throws Exception {
        var issued = login(customer());
        var refresh = cookie(issued, "SPAI_REFRESH");
        var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var call = (java.util.concurrent.Callable<MvcResult>) () -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(post("/api/auth/refresh").cookie(refresh).with(csrf())).andReturn();
            };
            var first = pool.submit(call);
            var second = pool.submit(call);
            start.countDown();
            var responses = List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS));
            assertEquals(List.of(204, 401), responses.stream().map(r -> r.getResponse().getStatus()).sorted().toList());
            var winner = responses.stream().filter(r -> r.getResponse().getStatus() == 204).findFirst().orElseThrow();
            mvc.perform(post("/api/auth/refresh").cookie(cookie(winner, "SPAI_REFRESH")).with(csrf())).andExpect(status().isNoContent());
        }
    }

    @Test void logoutWithExpiredAccessRevokesOnlyCurrentDevice() throws Exception {
        var user = customer();
        var first = login(user);
        var second = login(user);
        when(clock.instant()).thenReturn(NOW.plusSeconds(901));
        var loggedOut = mvc.perform(post("/api/auth/logout").cookie(cookie(first, "SPAI_ACCESS"), cookie(first, "SPAI_REFRESH")).with(csrf()))
                .andExpect(status().isNoContent()).andReturn();
        assertEquals(0, cookie(loggedOut, "SPAI_ACCESS").getMaxAge());
        assertEquals(0, cookie(loggedOut, "SPAI_REFRESH").getMaxAge());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(first, "SPAI_REFRESH")).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(second, "SPAI_REFRESH")).with(csrf())).andExpect(status().isNoContent());
        when(clock.instant()).thenReturn(NOW);
        mvc.perform(get("/api/users/me").cookie(cookie(first, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(cookie(second, "SPAI_ACCESS"))).andExpect(status().isOk());
    }

    @Test void logoutWithStaleRefreshAndExpiredAccessRevokesTheRotatedDevice() throws Exception {
        var issued = login(customer());
        when(clock.instant()).thenReturn(NOW.plusSeconds(901));
        var renewed = mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH")).with(csrf()))
                .andExpect(status().isNoContent()).andReturn();
        mvc.perform(post("/api/auth/logout").cookie(cookie(issued, "SPAI_ACCESS"), cookie(issued, "SPAI_REFRESH")).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").cookie(cookie(renewed, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(renewed, "SPAI_REFRESH")).with(csrf())).andExpect(status().isUnauthorized());
    }

    @Test void passwordChangeRetainsCurrentDeviceAndRevokesOtherAccessAndRefresh() throws Exception {
        var user = customer();
        var first = login(user);
        var second = login(user);
        var changed = mvc.perform(post("/api/users/me/password").cookie(cookie(first, "SPAI_ACCESS")).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"currentPassword\":\"Password123!\",\"newPassword\":\"ChangedPassword123!\"}"))
                .andExpect(status().isNoContent()).andReturn();
        mvc.perform(get("/api/users/me").cookie(cookie(changed, "SPAI_ACCESS"))).andExpect(status().isOk());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(changed, "SPAI_REFRESH")).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(get("/api/users/me").cookie(cookie(first, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").cookie(cookie(second, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(second, "SPAI_REFRESH")).with(csrf())).andExpect(status().isUnauthorized());
    }

    @Test void passwordResetRoleStatusAndDeletionInvalidateAccessAndRefresh() throws Exception {
        for (String mutation : List.of("password", "role", "disable", "delete")) {
            var user = customer();
            var issued = login(user);
            switch (mutation) {
                case "password" -> user.changePasswordHash(passwords.encode("ChangedPassword123!"));
                case "role" -> user.changeRole(UserAccount.Role.ADMIN);
                case "disable" -> user.changeEnabled(false);
                case "delete" -> user.disableAndDelete();
            }
            users.saveAndFlush(user);
            mvc.perform(get("/api/users/me").cookie(cookie(issued, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
            mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH")).with(csrf())).andExpect(status().isUnauthorized());
        }
    }

    @Test void tamperedAccessIsAnonymousOnPublicRoutesAndDeniedOnProtectedRoutes() throws Exception {
        var issued = login(customer());
        String value = cookie(issued, "SPAI_ACCESS").getValue();
        var tampered = new Cookie("SPAI_ACCESS", value.substring(0, value.lastIndexOf('.') + 1) + "invalid");
        mvc.perform(get("/api/products").cookie(tampered)).andExpect(status().isOk());
        mvc.perform(get("/api/users/me").cookie(tampered)).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest
    @ValueSource(strings = {"issuer", "audience", "subject", "sid", "cv", "fractionalCv", "role", "expiry", "issuedAt", "futureIssuedAt", "expiryNow"})
    void signedAccessRequiresExpectedIssuerAudienceAndCompleteTypedClaims(String mutation) throws Exception {
        var issued = login(customer());
        var valid = decoder.decode(cookie(issued, "SPAI_ACCESS").getValue());
        var values = new HashMap<String, Object>(valid.getClaims());
        switch (mutation) {
            case "issuer" -> values.put("iss", "other-issuer");
            case "audience" -> values.put("aud", List.of("other-api"));
            case "subject" -> values.remove("sub");
            case "sid" -> values.remove("sid");
            case "cv" -> values.put("cv", "bad");
            case "fractionalCv" -> values.put("cv", 0.5);
            case "role" -> values.put("role", "STAFF");
            case "expiry" -> values.remove("exp");
            case "issuedAt" -> values.remove("iat");
            case "futureIssuedAt" -> values.put("iat", NOW.plusSeconds(60));
            case "expiryNow" -> {
                values.put("iat", NOW.minusSeconds(60));
                values.put("exp", NOW);
            }
        }
        var claims = JwtClaimsSet.builder().claims(map -> map.putAll(values)).build();
        var header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        mvc.perform(get("/api/users/me").cookie(new Cookie("SPAI_ACCESS", token))).andExpect(status().isUnauthorized());
    }

    @Test void expiredAdminAccessCanRefreshAndRestoreProfileDuringMaintenance() throws Exception {
        var admin = customer();
        admin.changeRole(UserAccount.Role.ADMIN);
        admin = users.saveAndFlush(admin);
        var issued = login(admin);
        maintenance.setEnabled(true);
        try {
            when(clock.instant()).thenReturn(NOW.plusSeconds(901));
            mvc.perform(get("/api/users/me").cookie(cookie(issued, "SPAI_ACCESS"))).andExpect(status().isUnauthorized());
            var renewed = mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH")).with(csrf()))
                    .andExpect(status().isNoContent()).andReturn();
            mvc.perform(get("/api/users/me").cookie(cookie(renewed, "SPAI_ACCESS"))).andExpect(status().isOk());
        } finally {
            maintenance.setEnabled(false);
        }
    }

    @Test void commitFailureDoesNotWriteUncommittedAuthenticationCookies() throws Exception {
        var user = customer();
        doAnswer(invocation -> {
            var encoded = invocation.callRealMethod();
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override public void beforeCommit(boolean readOnly) {
                            throw new IllegalStateException("Simulated commit failure");
                        }
                    });
            return encoded;
        }).when(encoder).encode(any());
        var response = new MockHttpServletResponse();
        assertThrows(IllegalStateException.class, () -> authController.login(
                new LoginRequest(user.getEmail(), PASSWORD, List.of()),
                new MockHttpServletRequest(), response, null));
        assertTrue(response.getHeaders("Set-Cookie").isEmpty());
        assertEquals(0, jdbc.queryForObject("select count(*) from refresh_sessions where user_id = ?", Integer.class, user.getId()));
    }
    @ParameterizedTest
    @CsvSource({"missing,list", "missing,create", "missing,detail", "tampered,list", "tampered,create", "tampered,detail",
            "expired,list", "expired,create", "expired,detail"})
    void accountIntentCannotFallBackToGuestChat(String credentials, String operation) throws Exception {
        var user = customer();
        var issued = login(user);
        String guestToken = guestToken();
        String conversationId = guestConversation(guestToken);
        var request = switch (operation) {
            case "create" -> post("/api/ai/conversations").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                    .content("{\"topic\":\"SHOP_SUPPORT\"}");
            case "detail" -> get("/api/ai/conversations/{id}", conversationId);
            default -> get("/api/ai/conversations");
        };
        request.header("X-Account-Id", user.getId()).header("X-Guest-Session", guestToken);
        if (credentials.equals("expired")) {
            when(clock.instant()).thenReturn(NOW.plusSeconds(901));
            request.cookie(cookie(issued, "SPAI_ACCESS"));
        } else if (credentials.equals("tampered")) {
            request.cookie(new Cookie("SPAI_ACCESS", "invalid"));
        }
        int count = jdbc.queryForObject("select count(*) from ai_conversations", Integer.class);
        mvc.perform(request).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"))
                .andExpect(header().doesNotExist("Set-Cookie"));
        assertEquals(count, jdbc.queryForObject("select count(*) from ai_conversations", Integer.class));
    }

    @Test void matchingAccountIntentKeepsMemberChatOwnershipWhenGuestTokenIsPresent() throws Exception {
        var user = customer();
        var issued = login(user);
        String guestToken = guestToken();
        var created = mvc.perform(post("/api/ai/conversations").cookie(cookie(issued, "SPAI_ACCESS"))
                        .header("X-Account-Id", user.getId()).header("X-Guest-Session", guestToken).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"SHOP_SUPPORT\"}"))
                .andExpect(status().isCreated()).andReturn();
        var id = UUID.fromString(mapper.readTree(created.getResponse().getContentAsString()).path("conversationId").asText());
        assertEquals(user.getId(), jdbc.queryForObject("select user_id from ai_conversations where id = ?", UUID.class, id));
        assertNull(jdbc.queryForObject("select guest_id from ai_conversations where id = ?", UUID.class, id));
        mvc.perform(get("/api/ai/conversations/{id}", id).cookie(cookie(issued, "SPAI_ACCESS"))
                        .header("X-Account-Id", user.getId()).header("X-Guest-Session", guestToken))
                .andExpect(status().isOk());
        mvc.perform(get("/api/ai/conversations").cookie(cookie(issued, "SPAI_ACCESS"))
                        .header("X-Account-Id", user.getId()).header("X-Guest-Session", guestToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
    }

    @Test void changedAccountIntentRejectsMemberMutationBeforeAnySideEffect() throws Exception {
        var expected = customer();
        var actual = customer();
        var issued = login(actual);
        String guestToken = guestToken();
        int count = jdbc.queryForObject("select count(*) from ai_conversations", Integer.class);
        mvc.perform(post("/api/ai/conversations").cookie(cookie(issued, "SPAI_ACCESS"))
                        .header("X-Account-Id", expected.getId()).header("X-Guest-Session", guestToken).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"SHOP_SUPPORT\"}"))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("AUTH_CONTEXT_CHANGED"));
        assertEquals(count, jdbc.queryForObject("select count(*) from ai_conversations", Integer.class));
    }

    @Test void accountIntentTightensPublicApiAccessWithoutAuthenticatingFromTheHeader() throws Exception {
        var user = customer();
        mvc.perform(get("/api/products").header("X-Account-Id", user.getId())).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test void staleAccountIntentAllowsAuthAndMaintenanceDiscovery() throws Exception {
        var user = customer();
        var issued = login(user);
        String staleAccount = UUID.randomUUID().toString();
        mvc.perform(get("/api/auth/csrf").header("X-Account-Id", staleAccount)).andExpect(status().isOk());
        mvc.perform(get("/api/maintenance").header("X-Account-Id", staleAccount)).andExpect(status().isOk());
        mvc.perform(post("/api/auth/refresh").cookie(cookie(issued, "SPAI_REFRESH"))
                .header("X-Account-Id", staleAccount).with(csrf())).andExpect(status().isNoContent());
    }

    @Test void maintenanceAllowsCustomerIdentityDiscoveryWhileBlockingShopMutations() throws Exception {
        var user = customer();
        var issued = login(user);
        maintenance.setEnabled(true);
        try {
            mvc.perform(get("/api/users/me").cookie(cookie(issued, "SPAI_ACCESS")))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(user.getId().toString()));
            mvc.perform(put("/api/users/me").cookie(cookie(issued, "SPAI_ACCESS")).with(csrf())
                    .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isServiceUnavailable());
            mvc.perform(post("/api/users/me/password").cookie(cookie(issued, "SPAI_ACCESS")).with(csrf())
                    .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andExpect(status().isServiceUnavailable());
            mvc.perform(get("/api/cart").cookie(cookie(issued, "SPAI_ACCESS")))
                    .andExpect(status().isServiceUnavailable());
        } finally {
            maintenance.setEnabled(false);
        }
    }

    private String guestToken() throws Exception {
        String token = "legacy-guest-token-" + UUID.randomUUID();
        String hash = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        jdbc.update("insert into ai_guest_sessions(id,token_hash,created_at,expires_at) values(?,?,?,?)",
                UUID.randomUUID(), hash, java.sql.Timestamp.from(NOW), java.sql.Timestamp.from(NOW.plusSeconds(3600)));
        return token;
    }

    private String guestConversation(String token) throws Exception {
        String hash = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        UUID guestId = jdbc.queryForObject("select id from ai_guest_sessions where token_hash = ?", UUID.class, hash);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into ai_conversations(id,guest_id,topic,title,created_at,product_ids) values(?,?,?,?,?,?)",
                id, guestId, "SHOP_SUPPORT", "Legacy chat", java.sql.Timestamp.from(NOW), "[]");
        return id.toString();
    }
    private UserAccount customer() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Customer", "0900000000", passwords.encode(PASSWORD));
        user.activate();
        return users.saveAndFlush(user);
    }
    private MvcResult login(UserAccount user) throws Exception {
        return mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", user.getEmail(), "password", PASSWORD))))
                .andExpect(status().isOk()).andReturn();
    }
    private Cookie cookie(MvcResult result, String name) {
        var cookie = result.getResponse().getCookie(name);
        assertNotNull(cookie, "Missing cookie " + name);
        return cookie;
    }
}
