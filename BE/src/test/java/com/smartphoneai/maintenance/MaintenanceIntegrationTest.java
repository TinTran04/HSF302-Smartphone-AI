package com.smartphoneai.maintenance;

import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:maintenance;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=owner", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class MaintenanceIntegrationTest {
    @Autowired MockMvc mvc;
    @MockitoBean OtpSender sender;

    @Test void maintenanceBlocksShopButLeavesAuthAndAdminAvailable() throws Exception {
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"owner\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        mvc.perform(put("/api/admin/maintenance").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"enabled\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));
        mvc.perform(get("/api/products")).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("MAINTENANCE_MODE"));
        mvc.perform(get("/api/maintenance")).andExpect(status().isOk()).andExpect(jsonPath("$.enabled").value(true));
        mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk());
        mvc.perform(get("/api/admin/admins").session(session)).andExpect(status().isOk());
        mvc.perform(put("/api/admin/maintenance").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"enabled\":false}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }
}
