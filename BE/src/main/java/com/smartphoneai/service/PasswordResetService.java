package com.smartphoneai.service;

import com.smartphoneai.entity.OtpChallenge;
import java.util.UUID;
import java.util.Optional;
import java.time.Instant;

public interface PasswordResetService {
    OtpChallenge begin(String requestedEmail);

    record Verification(String resetToken, Instant expiresAt) {}

    Optional<Verification> verify(UUID challengeId, String code);

    boolean confirm(UUID challengeId, String resetToken, String newPassword);
}
