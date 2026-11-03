package com.smartphoneai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.Clock;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.MaintenanceService;
import org.springframework.security.web.context.SecurityContextHolderFilter;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean Clock clock() { return Clock.systemUTC(); }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, UserAccountRepository users, MaintenanceService maintenance) throws Exception {
        return http
                .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/*", "/api/brands", "/api/auth/csrf", "/api/maintenance").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/auth/otp/verify", "/api/auth/otp/resend", "/api/auth/password-reset", "/api/auth/password-reset/confirm", "/api/auth/admin-invitations/accept").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/cart/resolve").permitAll()
                        .requestMatchers("/api/ai/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/cart", "/api/cart/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/orders", "/api/orders/**").hasRole("CUSTOMER")
                        .anyRequest().authenticated())
                .exceptionHandling(errors -> errors.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterAfter(new AccountSessionFilter(users), SecurityContextHolderFilter.class)
                .addFilterAfter(new MaintenanceFilter(maintenance), AccountSessionFilter.class)
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .build();
    }
}
