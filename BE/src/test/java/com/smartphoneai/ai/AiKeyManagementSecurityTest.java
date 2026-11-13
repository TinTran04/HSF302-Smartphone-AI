package com.smartphoneai.ai;

import com.smartphoneai.config.SecurityConfig;
import com.smartphoneai.controller.AiKeyManagementController;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.MaintenanceService;
import com.smartphoneai.service.impl.AiKeyManagementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiKeyManagementController.class)
@Import(SecurityConfig.class)
class AiKeyManagementSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean AiKeyManagementService keys;
    @MockitoBean com.smartphoneai.service.impl.AiKeyEditorService editor;
    @MockitoBean com.smartphoneai.service.impl.AiActivityLogService activity;
    @MockitoBean UserAccountRepository users;
    @MockitoBean AuthTokenService tokens;
    @MockitoBean MaintenanceService maintenance;

    @Test @WithMockUser(roles = "CUSTOMER") void customerCannotViewOrChangeKeys() throws Exception {
        mvc.perform(get("/api/admin/ai-settings/key-management").param("provider", "GEMINI"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/ai-settings/key-management/1/promote/2").with(csrf()))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/admin/ai-settings/key-management/1/name").with(csrf()).contentType("application/json")
                .content("{\"keyRef\":\"PRIMARY\",\"name\":\"Project A\"}"))
                .andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN") void adminCanPromoteWithCsrf() throws Exception {
        mvc.perform(post("/api/admin/ai-settings/key-management/1/promote/2").with(csrf()))
                .andExpect(status().isOk());
        verify(keys).promote(1L, 2L);
    }

    @Test @WithMockUser(roles = "ADMIN") void adminCannotPromoteWithoutCsrf() throws Exception {
        mvc.perform(post("/api/admin/ai-settings/key-management/1/promote/2"))
                .andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "CUSTOMER") void customerCannotDeletePrimary() throws Exception {
        mvc.perform(delete("/api/admin/ai-settings/key-management/1/key/PRIMARY").with(csrf())
                .param("replacementKeyRef","2")).andExpect(status().isForbidden());
        org.mockito.Mockito.verifyNoInteractions(editor);
    }

    @Test @WithMockUser(roles = "ADMIN") void deletingPrimaryRequiresCsrf() throws Exception {
        mvc.perform(delete("/api/admin/ai-settings/key-management/1/key/PRIMARY").param("replacementKeyRef","2"))
                .andExpect(status().isForbidden());
        org.mockito.Mockito.verifyNoInteractions(editor);
    }

    @Test @WithMockUser(roles = "CUSTOMER") void customerCannotEditCheckOrReadActivity() throws Exception {
        mvc.perform(post("/api/admin/ai-settings/key-management/key").with(csrf()).contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/ai-settings/key-management/1/check/PRIMARY").with(csrf())).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/ai-settings/key-management/activity").param("provider","GROQ")).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/ai-settings/key-management/models").param("provider","DEEPSEEK")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN") void unifiedEditorRequiresCsrfAndAcceptsValidAdminPayload() throws Exception {
        String body="{\"provider\":\"GROQ\",\"configId\":\"1\",\"model\":\"custom-model\",\"keyRef\":\"PRIMARY\",\"name\":\"Main\",\"useDefault\":true}";
        mvc.perform(post("/api/admin/ai-settings/key-management/key").contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/ai-settings/key-management/key").with(csrf()).contentType("application/json").content(body)).andExpect(status().isOk());
        verify(editor).edit(org.mockito.ArgumentMatchers.argThat(input->input.provider().equals("GROQ")&&input.configId().equals(1L)&&input.model().equals("custom-model")));
    }
}
