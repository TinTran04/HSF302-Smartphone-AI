package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.AdminInvitationSender;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
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
        "app.root-admin.username=owner", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class AdminManagementIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean OtpSender otpSender;
    @MockitoBean AdminInvitationSender invitationSender;

    @Test void rootInvitesAdminWhoSetsPasswordAndCannotDeleteRoot() throws Exception {
        var token = new AtomicReference<String>();
        doAnswer(inv -> { token.set(inv.getArgument(1)); return null; })
                .when(invitationSender).send(anyString(), anyString());
        var rootSession = new MockHttpSession();
        var rootLogin = mvc.perform(post("/api/auth/login").session(rootSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"owner\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andReturn();
        String rootId = mapper.readTree(rootLogin.getResponse().getContentAsString()).path("user").path("id").asText();
        var invited = mvc.perform(post("/api/admin/admin-invitations").session(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"admin@example.com\",\"fullName\":\"Admin Two\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String oldToken = token.get();
        String invitationId = mapper.readTree(invited.getResponse().getContentAsString()).path("id").asText();
        var list = mvc.perform(get("/api/admin/admins").session(rootSession)).andExpect(status().isOk()).andReturn();
        var pending = mapper.readTree(list.getResponse().getContentAsString()).findValues("invitationId");
        org.junit.jupiter.api.Assertions.assertTrue(pending.stream().anyMatch(id -> id.asText().equals(invitationId)));
        mvc.perform(post("/api/admin/admin-invitations/" + invitationId + "/resend").session(rootSession).with(csrf()))
                .andExpect(status().isAccepted());
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("token", oldToken, "password", "AdminPassword123!"))))
                .andExpect(status().isConflict());
        String accept = mapper.writeValueAsString(Map.of("token", token.get(), "password", "AdminPassword123!"));
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/admin-invitations/accept").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isConflict());
        var adminSession = new MockHttpSession();
        var adminLogin = mvc.perform(post("/api/auth/login").session(adminSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"admin@example.com\",\"password\":\"AdminPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN")).andReturn();
        String adminId = mapper.readTree(adminLogin.getResponse().getContentAsString()).path("user").path("id").asText();
        mvc.perform(delete("/api/admin/admins/" + rootId).session(adminSession).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(patch("/api/admin/admins/" + adminId + "/role").session(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/admin/admins").session(adminSession)).andExpect(status().isUnauthorized());
    }
}
