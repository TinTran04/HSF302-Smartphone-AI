package com.smartphoneai.security;

import com.smartphoneai.config.SecurityConfig;
import com.smartphoneai.controller.ProductController;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.service.ProductService;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.MaintenanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
class SecurityConfigTest {
    @Autowired MockMvc mvc;
    @MockitoBean ProductService service;
    @MockitoBean UserAccountRepository users;
    @MockitoBean MaintenanceService maintenance;

    @Test void catalogIsPublic() throws Exception {
        when(service.listActive("", 1, 20)).thenReturn(new PageResponse<>(List.of(), 1, 20, 0, 0));
        mvc.perform(get("/api/products")).andExpect(status().isOk());
    }

    @Test void unknownAdminApiIsNotPublic() throws Exception {
        mvc.perform(get("/api/admin/products")).andExpect(status().isUnauthorized());
    }

    @Test @WithMockUser(roles = "CUSTOMER")
    void customerCannotAccessAdminApi() throws Exception {
        mvc.perform(get("/api/admin/products")).andExpect(status().isForbidden());
    }
}
