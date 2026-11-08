package com.smartphoneai.config;

import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.impl.AuthTokenServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class AccountSessionFilter extends OncePerRequestFilter {
    private final AuthTokenService tokens;
    public AccountSessionFilter(AuthTokenService tokens) { this.tokens = tokens; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                              FilterChain chain) throws ServletException, IOException {
        var authentication = AuthTokenServiceImpl.cookie(request, AuthTokenServiceImpl.ACCESS_COOKIE).flatMap(tokens::authenticate);
        authentication.ifPresent(auth -> {
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
        });
        String path = request.getRequestURI().substring(request.getContextPath().length());
        String expectedAccountId = request.getHeader("X-Account-Id");
        boolean accountRequired = expectedAccountId != null && path.startsWith("/api/")
                && !path.startsWith("/api/auth/") && !path.equals("/api/maintenance");
        if (accountRequired) {
            if (authentication.isEmpty() || !(authentication.get().getPrincipal() instanceof AccountPrincipal principal)) {
                reject(response, HttpServletResponse.SC_UNAUTHORIZED, "AUTHENTICATION_REQUIRED",
                        "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.");
                return;
            }
            if (!principal.id().toString().equals(expectedAccountId)) {
                reject(response, HttpServletResponse.SC_CONFLICT, "AUTH_CONTEXT_CHANGED",
                        "Tài khoản đã thay đổi. Vui lòng tải lại trang.");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }
}
