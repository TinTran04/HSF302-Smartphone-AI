package com.smartphoneai.service.impl;

import com.smartphoneai.service.LoginService;
import com.smartphoneai.service.OtpChallengeService;

import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
public class LoginServiceImpl implements LoginService {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final OtpChallengeService otp;
    public LoginServiceImpl(UserAccountRepository users, PasswordEncoder passwords, OtpChallengeService otp) {
        this.users = users; this.passwords = passwords; this.otp = otp;
    }
    @Override
    @Transactional
    public LoginResult beginLogin(LoginRequest request) {
        String identifier = request.identifier().trim().toLowerCase(Locale.ROOT);
        var user = (identifier.contains("@") ? users.findLockedByEmail(identifier) : users.findLockedByUsername(identifier)).orElse(null);
        if (user == null || user.isDeleted() || !passwords.matches(request.password(), user.getPasswordHash())) throw new InvalidCredentialsException();
        if (!user.isActive()) {
            if (user.getRole() != UserAccount.Role.CUSTOMER) throw new InvalidCredentialsException();
            return new LoginResult(null, otp.issue(user.getEmail(), "REGISTER"));
        }
        if (user.getRole() == UserAccount.Role.ADMIN) return new LoginResult(user, null);
        return new LoginResult(null, otp.issue(user.getEmail(), "LOGIN"));
    }
}
