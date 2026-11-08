package com.smartphoneai.config;

import com.smartphoneai.service.MaintenanceService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;

public class MaintenanceFilter extends OncePerRequestFilter {
    private final MaintenanceService maintenance;
    public MaintenanceFilter(MaintenanceService maintenance) { this.maintenance = maintenance; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                              FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        boolean productImage = path.startsWith("/api/product-images/") && request.getMethod().equals("GET");
        boolean shopApi = path.startsWith("/api/") && !path.startsWith("/api/auth/")
                && !path.startsWith("/api/admin/") && !path.equals("/api/maintenance") && !productImage;
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean profileApi = path.equals("/api/users/me") || path.equals("/api/users/me/password");
        boolean locationLookup = (path.equals("/api/locations/autocomplete") || path.equals("/api/locations/reverse")) && request.getMethod().equals("GET");
        boolean identityDiscovery = path.equals("/api/users/me") && request.getMethod().equals("GET");
        boolean unauthenticatedProfile = (profileApi || locationLookup) && authentication == null;
        boolean adminProfile = (profileApi || locationLookup) && authentication != null
                && authentication.getPrincipal() instanceof AccountPrincipal
                && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (shopApi && !identityDiscovery && !unauthenticatedProfile && !adminProfile && maintenance.isEnabled()) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"code\":\"MAINTENANCE_MODE\",\"message\":\"Hệ thống đang bảo trì\",\"timestamp\":\"" + Instant.now() + "\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
