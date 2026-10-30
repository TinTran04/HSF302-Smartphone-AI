package com.smartphoneai.service;

import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.exception.InvalidPasswordException;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
public class PasswordResetService {
    private final UserAccountRepository users;
    private final OtpChallengeRepository challenges;
    private final OtpChallengeService otp;
    private final PasswordEncoder passwords;
    public PasswordResetService(UserAccountRepository users, OtpChallengeRepository challenges,
                                OtpChallengeService otp, PasswordEncoder passwords) {
        this.users = users; this.challenges = challenges; this.otp = otp; this.passwords = passwords;
    }
    @Transactional
    public OtpChallenge begin(String requestedEmail) {
        String email = requestedEmail.trim().toLowerCase(Locale.ROOT);
        var user = users.findLockedByEmail(email).orElse(null);
        return otp.issue(email, "PASSWORD_RESET", user != null && user.isActive());
    }
    @Transactional
    public boolean confirm(UUID challengeId, String code, String newPassword) {
        if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        var challenge = challenges.findById(challengeId).orElse(null);
        if (challenge == null || !"PASSWORD_RESET".equals(challenge.getPurpose()) || !challenge.isDeliverable()) return false;
        var user = users.findLockedByEmail(challenge.getEmail()).orElse(null);
        if (user == null || !user.isActive()) return false;
        if (otp.verify(challengeId, "PASSWORD_RESET", code) != OtpChallenge.Result.SUCCESS) return false;
        user.changePasswordHash(passwords.encode(newPassword));
        return true;
    }
}
