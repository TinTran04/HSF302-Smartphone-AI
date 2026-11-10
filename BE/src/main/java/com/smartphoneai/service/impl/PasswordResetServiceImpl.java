package com.smartphoneai.service.impl;

import com.smartphoneai.service.OtpChallengeService;
import com.smartphoneai.service.PasswordResetService;

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
import java.util.Optional;
import java.util.Base64;
import java.security.SecureRandom;
import java.time.Clock;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {
    private final UserAccountRepository users;
    private final OtpChallengeRepository challenges;
    private final OtpChallengeService otp;
    private final PasswordEncoder passwords;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    public PasswordResetServiceImpl(UserAccountRepository users, OtpChallengeRepository challenges,
                                OtpChallengeService otp, PasswordEncoder passwords, Clock clock) {
        this.users = users; this.challenges = challenges; this.otp = otp; this.passwords = passwords;
        this.clock = clock;
    }
    @Override
    @Transactional
    public OtpChallenge begin(String requestedEmail) {
        String email = requestedEmail.trim().toLowerCase(Locale.ROOT);
        var user = users.findLockedByEmail(email).orElse(null);
        return otp.issue(email, "PASSWORD_RESET", eligible(user));
    }
    private static boolean eligible(com.smartphoneai.entity.UserAccount user) {
        return user != null && !user.isDeleted() && !user.isDisabled() && !user.isPendingInvitation()
                && (user.isActive() || user.getRole() == com.smartphoneai.entity.UserAccount.Role.CUSTOMER);
    }
    @Override
    @Transactional
    public Optional<Verification> verify(UUID challengeId, String code) {
        var email = challenges.findPasswordResetEmail(challengeId).orElse(null);
        if (email == null) return Optional.empty();
        var user = users.findLockedByEmail(email).orElse(null);
        if (!eligible(user) || otp.verify(challengeId, "PASSWORD_RESET", code) != OtpChallenge.Result.SUCCESS) return Optional.empty();
        var challenge = challenges.findLockedById(challengeId).orElseThrow();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        var expiresAt = clock.instant().plusSeconds(300);
        challenge.authorizePasswordReset(passwords.encode(token), expiresAt, user.getCredentialVersion());
        return Optional.of(new Verification(token, expiresAt));
    }

    @Override
    @Transactional
    public boolean confirm(UUID challengeId, String resetToken, String newPassword) {
        if (newPassword.length() < 8 || newPassword.getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        var email = challenges.findPasswordResetEmail(challengeId).orElse(null);
        if (email == null) return false;
        var user = users.findLockedByEmail(email).orElse(null);
        if (!eligible(user)) return false;
        var challenge = challenges.findLockedById(challengeId).orElseThrow();
        String tokenHash = challenge.getResetTokenHash();
        boolean matches = resetToken != null && resetToken.getBytes(StandardCharsets.UTF_8).length <= 72
                && tokenHash != null && passwords.matches(resetToken, tokenHash);
        if (!challenge.consumePasswordReset(matches, clock.instant(), user.getCredentialVersion())) return false;
        user.changePasswordHash(passwords.encode(newPassword));
        return true;
    }
}
