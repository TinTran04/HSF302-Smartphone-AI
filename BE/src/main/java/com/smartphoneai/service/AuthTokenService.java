package com.smartphoneai.service;

import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.entity.UserAccount;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;

public interface AuthTokenService {
    Cookies issue(UserAccount user);
    Cookies refresh(HttpServletRequest request);
    Cookies logout(HttpServletRequest request);
    Cookies changePassword(AccountPrincipal principal, String currentPassword, String newPassword);
    Optional<Authentication> authenticate(String accessToken);

    /** Prepared cookie headers are written only after the credential transaction commits. */
    record Cookies(List<String> headers) {
        public Cookies { headers = List.copyOf(headers); }
        public void writeTo(HttpServletResponse response) {
            headers.forEach(value -> response.addHeader(HttpHeaders.SET_COOKIE, value));
        }
    }
}
