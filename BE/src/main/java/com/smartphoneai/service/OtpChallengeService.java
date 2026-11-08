package com.smartphoneai.service;

import com.smartphoneai.entity.OtpChallenge;
import java.util.UUID;

public interface OtpChallengeService {
    OtpChallenge issue(String email, String purpose);

    OtpChallenge issue(String email, String purpose, boolean deliverable);

    OtpChallenge.Result verify(UUID id, String purpose, String code);

    boolean resend(UUID id);
}
