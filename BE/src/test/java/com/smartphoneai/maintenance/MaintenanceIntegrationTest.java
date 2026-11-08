package com.smartphoneai.maintenance;

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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:maintenance;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=owner@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class MaintenanceIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean OtpSender sender;

    @Test void maintenanceBlocksShopButLeavesAuthAndAdminAvailable() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"owner@example.com\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/admin/maintenance").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"enabled\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));
        mvc.perform(get("/api/products")).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("MAINTENANCE_MODE"));
        mvc.perform(get("/api/maintenance")).andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk());
        mvc.perform(get("/api/admin/admins").with(session)).andExpect(status().isOk());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isOk());
        mvc.perform(post("/api/users/me/password").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{}" )).andExpect(status().isBadRequest());
        mvc.perform(get("/api/products").with(session)).andExpect(status().isServiceUnavailable());
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/admin/maintenance").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"enabled\":false}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }
}
