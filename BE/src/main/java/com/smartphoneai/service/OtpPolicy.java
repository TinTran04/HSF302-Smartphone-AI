package com.smartphoneai.service;

import java.time.Instant;

public final class OtpPolicy {
    private OtpPolicy() {}
    public static boolean mayVerify(Instant issuedAt, Instant now, int failedAttempts, boolean consumed) {
        return !consumed && failedAttempts >= 0 && failedAttempts < 5
                && !now.isBefore(issuedAt) && now.isBefore(issuedAt.plusSeconds(300));
    }
    public static boolean mayResend(Instant issuedAt, Instant now) {
        return !now.isBefore(issuedAt.plusSeconds(60));
    }
}
