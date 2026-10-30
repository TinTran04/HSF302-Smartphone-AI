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

    @Test void rootAdminLogsInWithoutOtp() throws Exception {
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"rootadmin\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("ADMIN"));
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
