package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.repository.AdminInvitationRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AdminInvitationSender;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.exception.EmailDeliveryException;
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

import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:accountmanage;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=accounts-owner@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AccountManagementIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired AdminInvitationRepository invitations;
    @Autowired PasswordEncoder passwords;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean OtpSender otpSender;
    @MockitoBean AdminInvitationSender invitationSender;

    @Test void customerInvitationCanBeResentAcceptedAndPromotedThenDemoted() throws Exception {
        var root = rootSession();
        var token = captureToken();
        String email = "invited-customer@example.com";
        String invitationId = invite(root, email, "CUSTOMER");
        var user = users.findByEmail(email).orElseThrow();
        assertFalse(user.isActive());
        assertEquals("CUSTOMER", user.getRole().name());
        assertEquals("!", user.getPasswordHash());
        var reset = mvc.perform(post("/api/auth/password-reset").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isAccepted()).andReturn();
        verifyNoInteractions(otpSender);
        String challengeId = mapper.readTree(reset.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/password-reset/verify").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", challengeId, "code", "123456"))))
                .andExpect(status().isConflict());
        String oldToken = token.get();
        assertFalse(jdbc.queryForObject("select token_hash from admin_invitations where id = ?",
                String.class, java.util.UUID.fromString(invitationId)).contains(oldToken));
        mvc.perform(get("/api/admin/accounts").with(root)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.user.email == 'invited-customer@example.com')].active").value(false));
        role(root, user.getId().toString(), "ADMIN", 403);
        mvc.perform(post("/api/admin/account-invitations/{id}/resend", invitationId).with(root).with(csrf()))
                .andExpect(status().isAccepted());
        assertNotEquals(oldToken, token.get());
        accept(oldToken, 409);
        accept(token.get(), 204);
        accept(token.get(), 409);
        user = users.findById(user.getId()).orElseThrow();
        assertTrue(user.isActive());
        assertTrue(passwords.matches("InvitationPass123!", user.getPasswordHash()));
        mvc.perform(post("/api/admin/account-invitations/{id}/resend", invitationId).with(root).with(csrf()))
                .andExpect(status().isConflict());
        role(root, user.getId().toString(), "ADMIN", 200);
        var promotedSession = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(promotedSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", email, "password", "InvitationPass123!"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN"));
        role(root, user.getId().toString(), "CUSTOMER", 200);
        mvc.perform(get("/api/admin/accounts").with(promotedSession)).andExpect(status().isUnauthorized());
        assertEquals("CUSTOMER", users.findById(user.getId()).orElseThrow().getRole().name());
    }

    @Test void adminInvitationAndRoleGuardsPreserveRootAndRejectInvalidRoles() throws Exception {
        var root = rootSession();
        var token = captureToken();
        invite(root, "managed-admin@example.com", "ADMIN");
        accept(token.get(), 204);
        var admin = users.findByEmail("managed-admin@example.com").orElseThrow();
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("identifier", admin.getEmail(), "password", "InvitationPass123!"))))
                .andExpect(status().isOk());
        role(session, admin.getId().toString(), "CUSTOMER", 403);
        role(session, users.findByRootKey("ROOT").orElseThrow().getId().toString(), "CUSTOMER", 403);
        role(root, admin.getId().toString(), "STAFF", 400);
        mvc.perform(post("/api/admin/account-invitations").with(root).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"invalid-role@example.com\",\"fullName\":\"Invalid\",\"role\":\"MANAGER\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/api/admin/account-invitations").with(root).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"managed-admin@example.com\",\"fullName\":\"Duplicate\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/admin/accounts")).andExpect(status().isUnauthorized());
    }

    @Test void failedMailRollsBackCreationAndExpiredInvitationCanBeResent() throws Exception {
        var root = rootSession();
        long count = invitations.count();
        doThrow(new EmailDeliveryException("Test mail failure")).when(invitationSender).send(anyString(), anyString());
        mvc.perform(post("/api/admin/account-invitations").with(root).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"retry-invite@example.com\",\"fullName\":\"Retry\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isServiceUnavailable());
        assertFalse(users.existsByEmail("retry-invite@example.com"));
        assertEquals(count, invitations.count());
        var token = captureToken();
        String invitationId = invite(root, "retry-invite@example.com", "CUSTOMER");
        jdbc.update("update admin_invitations set expires_at = ? where id = ?",
                java.sql.Timestamp.from(java.time.Instant.now().minusSeconds(60)), java.util.UUID.fromString(invitationId));
        accept(token.get(), 409);
        mvc.perform(post("/api/admin/account-invitations/{id}/resend", invitationId).with(root).with(csrf()))
                .andExpect(status().isAccepted());
        accept(token.get(), 204);
    }

    private JwtTestClient rootSession() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"accounts-owner@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        return session;
    }

    private AtomicReference<String> captureToken() {
        var token = new AtomicReference<String>();
        doAnswer(invocation -> { token.set(invocation.getArgument(1)); return null; })
                .when(invitationSender).send(anyString(), anyString());
        return token;
    }

    private String invite(JwtTestClient session, String email, String role) throws Exception {
        var result = mvc.perform(post("/api/admin/account-invitations").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(
                        Map.of("email", email, "fullName", "Invited Account", "role", role))))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.token").doesNotExist()).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString()).path("id").asText();
    }

    private void accept(String token, int status) throws Exception {
        mvc.perform(post("/api/auth/account-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("token", token, "password", "InvitationPass123!"))))
                .andExpect(status().is(status));
    }

    private void role(JwtTestClient session, String id, String role, int status) throws Exception {
        mvc.perform(patch("/api/admin/accounts/{id}/role", id).with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("role", role))))
                .andExpect(status().is(status));
    }
}
