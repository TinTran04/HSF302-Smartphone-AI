package com.smartphoneai.config;

import com.smartphoneai.repository.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

public class AccountSessionFilter extends OncePerRequestFilter {
    private final UserAccountRepository users;
    public AccountSessionFilter(UserAccountRepository users) { this.users = users; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                              FilterChain chain) throws ServletException, IOException {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AccountPrincipal principal) {
            var account = users.findById(principal.id()).orElse(null);
            boolean valid = account != null && account.isActive() && !account.isDeleted()
                    && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_" + account.getRole().name()));
            if (!valid) {
                SecurityContextHolder.clearContext();
                var session = request.getSession(false);
                if (session != null) session.invalidate();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
