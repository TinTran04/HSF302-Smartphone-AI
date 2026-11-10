package com.smartphoneai.ai;

import com.smartphoneai.config.SecurityConfig;
import com.smartphoneai.controller.AiQuotaSettingsController;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.*;
import com.smartphoneai.service.impl.AiQuotaSettingsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiQuotaSettingsController.class)
@Import(SecurityConfig.class)
class AiQuotaSettingsSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean AiQuotaSettingsService quota;
    @MockitoBean UserAccountRepository users;
    @MockitoBean AuthTokenService tokens;
    @MockitoBean MaintenanceService maintenance;
    private static final String BODY = "{\"configId\":1,\"keys\":[]}";

    @Test void anonymousCannotSave() throws Exception {
        mvc.perform(put("/api/admin/ai-settings/quota").with(csrf()).contentType("application/json").content(BODY))
                .andExpect(status().isUnauthorized());
    }
    @Test @WithMockUser(roles="CUSTOMER") void customerCannotSave() throws Exception {
        mvc.perform(put("/api/admin/ai-settings/quota").with(csrf()).contentType("application/json").content(BODY))
                .andExpect(status().isForbidden());
    }
    @Test @WithMockUser(roles="ADMIN") void adminCanSaveWithCsrf() throws Exception {
        mvc.perform(put("/api/admin/ai-settings/quota").with(csrf()).contentType("application/json").content(BODY))
                .andExpect(status().isOk());
    }
    @Test @WithMockUser(roles="ADMIN") void adminCannotSaveWithoutCsrf() throws Exception {
        mvc.perform(put("/api/admin/ai-settings/quota").contentType("application/json").content(BODY))
                .andExpect(status().isForbidden());
    }
}
