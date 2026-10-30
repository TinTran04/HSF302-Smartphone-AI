package com.smartphoneai.service;

import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
public class LoginService {
    public record LoginResult(UserAccount user, OtpChallenge challenge) {}
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final OtpChallengeService otp;
    public LoginService(UserAccountRepository users, PasswordEncoder passwords, OtpChallengeService otp) {
        this.users = users; this.passwords = passwords; this.otp = otp;
    }
    @Transactional
    public LoginResult beginLogin(LoginRequest request) {
        String identifier = request.identifier().trim().toLowerCase(Locale.ROOT);
        var user = (identifier.contains("@") ? users.findLockedByEmail(identifier) : users.findLockedByUsername(identifier)).orElse(null);
        if (user == null || !user.isActive()
                || !passwords.matches(request.password(), user.getPasswordHash())) throw new InvalidCredentialsException();
        if (user.getRole() == UserAccount.Role.ADMIN) return new LoginResult(user, null);
        return new LoginResult(null, otp.issue(user.getEmail(), "LOGIN"));
    }
}
