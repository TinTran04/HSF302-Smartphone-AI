package com.smartphoneai.auth;

import com.smartphoneai.service.OtpSender;
import com.smartphoneai.config.RootAdminInitializer;
import com.smartphoneai.repository.UserAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:rootadmin;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=rootadmin@example.com",
        "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
@Transactional
class RootAdminIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean OtpSender sender;
    @Autowired RootAdminInitializer initializer;
    @Autowired UserAccountRepository users;
    @Autowired JdbcTemplate jdbc;

    @Test void legacyRootIsMigratedAndOnlyEmailCanLogIn() throws Exception {
        jdbc.update("update users set email=null, username='legacy-root' where root_key='ROOT'");
        var root = users.findByRootKey("ROOT").orElseThrow();
        var id = root.getId();
        var passwordHash = root.getPasswordHash();
        initializer.run(null);
        assertEquals(id, root.getId());
        assertEquals(passwordHash, root.getPasswordHash());
        assertEquals("rootadmin@example.com", root.getEmail());
        assertNull(root.getUsername());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"legacy-root\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\" ROOTADMIN@EXAMPLE.COM \",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.id").value(id.toString()));
        verifyNoInteractions(sender);
    }

    @Test void staleAccountSessionDoesNotBlockPublicRegistration() throws Exception {
        mvc.perform(post("/api/auth/register").with(staleSession()).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        mvc.perform(get("/api/auth/csrf").with(staleSession())).andExpect(status().isOk());
        mvc.perform(get("/api/users/me").with(staleSession())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/admins").with(staleSession())).andExpect(status().isUnauthorized());
    }

    private JwtTestClient staleSession() {
        return JwtTestClient.invalid();
    }

    @Test void rootAdminLogsInWithoutOtp() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.user.email").value("rootadmin@example.com"));
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(post("/api/users/me/password").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"wrongpass\",\"newPassword\":\"NewRootPass123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/users/me/password").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"currentPassword\":\"TestRootPassword123!\",\"newPassword\":\"NewRootPass123!\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/logout").with(session).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin@example.com\",\"password\":\"NewRootPass123!\"}"))
                .andExpect(status().isOk());
        verifyNoInteractions(sender);
    }
}
