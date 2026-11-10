package com.smartphoneai.security;

import com.smartphoneai.config.SecurityConfig;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.MaintenanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StorefrontRoleSecurityTest.ProbeController.class)
@Import({SecurityConfig.class, StorefrontRoleSecurityTest.ProbeController.class})
class StorefrontRoleSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean UserAccountRepository users;
    @MockitoBean com.smartphoneai.service.AuthTokenService tokens;
    @MockitoBean MaintenanceService maintenance;

    @ParameterizedTest
    @ValueSource(strings = {"/api/products", "/api/products/1", "/api/brands", "/api/ai/conversations"})
    @WithMockUser(roles = "ADMIN")
    void adminCannotReadStorefrontApis(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/cart/resolve", "/api/ai/guest-sessions", "/api/ai/conversations"})
    @WithMockUser(roles = "ADMIN")
    void adminCannotCreateStorefrontGuestState(String path) throws Exception {
        mvc.perform(post(path).with(csrf())).andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/products", "/api/products/1", "/api/brands"})
    void guestCanReadPublicStorefrontApis(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/cart/resolve"})
    void guestCanCreateStorefrontGuestState(String path) throws Exception {
        mvc.perform(post(path).with(csrf())).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/products", "/api/products/1", "/api/brands", "/api/ai/conversations", "/api/cart", "/api/orders"})
    @WithMockUser(roles = "CUSTOMER")
    void customerKeepsStorefrontAccess(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/admin/products", "/api/admin/ai-settings", "/api/users/me"})
    @WithMockUser(roles = "ADMIN")
    void adminKeepsPortalAndPersonalProfileAccess(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminKeepsPersonalPasswordAccess() throws Exception {
        mvc.perform(post("/api/users/me/password").with(csrf())).andExpect(status().isOk());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/cart", "/api/orders"})
    @WithMockUser(roles = "ADMIN")
    void adminCannotReadCustomerState(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/admin/products", "/api/admin/ai-settings"})
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotReadPortalApis(String path) throws Exception {
        mvc.perform(get(path)).andExpect(status().isForbidden());
    }

    @ParameterizedTest
    @ValueSource(strings = {"/api/auth/register", "/api/auth/login", "/api/auth/otp/verify", "/api/auth/otp/resend", "/api/auth/password-reset", "/api/auth/password-reset/verify", "/api/auth/password-reset/confirm", "/api/auth/admin-invitations/accept", "/api/auth/account-invitations/accept"})
    void accountAccessEndpointsRemainPublic(String path) throws Exception {
        mvc.perform(post(path).with(csrf())).andExpect(status().isOk());
    }

    @RestController
    static class ProbeController {
        @RequestMapping({"/api/products", "/api/products/1", "/api/brands", "/api/ai/conversations", "/api/cart/resolve", "/api/ai/guest-sessions", "/api/cart", "/api/orders", "/api/admin/products", "/api/admin/ai-settings", "/api/users/me", "/api/users/me/password", "/api/auth/register", "/api/auth/login", "/api/auth/otp/verify", "/api/auth/otp/resend", "/api/auth/password-reset", "/api/auth/password-reset/verify", "/api/auth/password-reset/confirm", "/api/auth/admin-invitations/accept", "/api/auth/account-invitations/accept"})
        Map<String, Boolean> reachable() { return Map.of("reachable", true); }
    }
}
