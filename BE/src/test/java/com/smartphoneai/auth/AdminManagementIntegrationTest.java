package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.AdminInvitationSender;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:adminmanage;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=owner@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class AdminManagementIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean OtpSender otpSender;
    @MockitoBean AdminInvitationSender invitationSender;

    @Test void rootInvitesAdminWhoSetsPasswordAndCannotDeleteRoot() throws Exception {
        var token = new AtomicReference<String>();
        doAnswer(inv -> { token.set(inv.getArgument(1)); return null; })
                .when(invitationSender).send(anyString(), anyString());
        var rootSession = new JwtTestClient();
        var rootLogin = mvc.perform(post("/api/auth/login").with(rootSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"owner@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andReturn();
        String rootId = mapper.readTree(rootLogin.getResponse().getContentAsString()).path("user").path("id").asText();
        mvc.perform(post("/api/admin/admin-invitations").with(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"staff@example.com\",\"fullName\":\"Staff\",\"role\":\"STAFF\"}"))
                .andExpect(status().isBadRequest());
        var invited = mvc.perform(post("/api/admin/admin-invitations").with(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"fullName\":\"Admin Two\"}"))
                .andExpect(status().isAccepted()).andReturn();
        var pendingList = mvc.perform(get("/api/admin/admins").with(rootSession)).andReturn();
        var entries = mapper.readTree(pendingList.getResponse().getContentAsString());
        String pendingId = "";
        for (var entry : entries) if ("admin@example.com".equals(entry.path("user").path("email").asText())) pendingId=entry.path("user").path("id").asText();
        mvc.perform(patch("/api/admin/admins/" + pendingId + "/role").with(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"CUSTOMER\"}")).andExpect(status().isForbidden());
        String oldToken = token.get();
        String invitationId = mapper.readTree(invited.getResponse().getContentAsString()).path("id").asText();
        var list = mvc.perform(get("/api/admin/admins").with(rootSession)).andExpect(status().isOk()).andReturn();
        var pending = mapper.readTree(list.getResponse().getContentAsString()).findValues("invitationId");
        org.junit.jupiter.api.Assertions.assertTrue(pending.stream().anyMatch(id -> id.asText().equals(invitationId)));
        mvc.perform(post("/api/admin/admin-invitations/" + invitationId + "/resend").with(rootSession).with(csrf()))
                .andExpect(status().isAccepted());
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("token", oldToken, "password", "AdminPassword123!"))))
                .andExpect(status().isConflict());
        String accept = mapper.writeValueAsString(Map.of("token", token.get(), "password", "AdminPassword123!"));
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isConflict());
        var adminSession = new JwtTestClient();
        var adminLogin = mvc.perform(post("/api/auth/login").with(adminSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"admin@example.com\",\"password\":\"AdminPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN")).andReturn();
        String adminId = mapper.readTree(adminLogin.getResponse().getContentAsString()).path("user").path("id").asText();
        mvc.perform(delete("/api/admin/admins/" + rootId).with(adminSession).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/admins/" + adminId + "/role").with(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"STAFF\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/admins/" + adminId + "/role").with(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
        mvc.perform(get("/api/admin/admins").with(adminSession)).andExpect(status().isUnauthorized());
    }
}
