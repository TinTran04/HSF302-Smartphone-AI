package com.smartphoneai.service;

import com.smartphoneai.entity.OtpChallenge;
import java.util.UUID;

public interface PasswordResetService {
    OtpChallenge begin(String requestedEmail);

    boolean confirm(UUID challengeId, String code, String newPassword);
}
