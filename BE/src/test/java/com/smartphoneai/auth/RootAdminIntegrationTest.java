package com.smartphoneai.auth;

import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:rootadmin;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=rootadmin", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class RootAdminIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean OtpSender sender;

    @Test void staleAccountSessionDoesNotBlockPublicRegistration() throws Exception {
        mvc.perform(post("/api/auth/register").session(staleSession()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/auth/csrf").session(staleSession())).andExpect(status().isOk());
        mvc.perform(get("/api/users/me").session(staleSession())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/admins").session(staleSession())).andExpect(status().isUnauthorized());
    }

    private MockHttpSession staleSession() {
        var principal = new com.smartphoneai.config.AccountPrincipal(java.util.UUID.randomUUID());
        var authentication = org.springframework.security.authentication.UsernamePasswordAuthenticationToken.authenticated(
                principal, null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        var context = org.springframework.security.core.context.SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        var session = new MockHttpSession();
        session.setAttribute(org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return session;
    }

    @Test void rootAdminLogsInWithoutOtp() throws Exception {
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.email").doesNotExist());
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(post("/api/users/me/password").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"wrongpass\",\"newPassword\":\"NewRootPass123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/users/me/password").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"TestRootPassword123!\",\"newPassword\":\"NewRootPass123!\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin\",\"password\":\"NewRootPass123!\"}"))
                .andExpect(status().isOk());
        verifyNoInteractions(sender);
    }
}
