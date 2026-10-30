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
        boolean shopApi = path.startsWith("/api/") && !path.startsWith("/api/auth/")
                && !path.startsWith("/api/admin/") && !path.equals("/api/maintenance");
        if (shopApi && maintenance.isEnabled()) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"code\":\"MAINTENANCE_MODE\",\"message\":\"Hệ thống đang bảo trì\",\"timestamp\":\"" + Instant.now() + "\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
