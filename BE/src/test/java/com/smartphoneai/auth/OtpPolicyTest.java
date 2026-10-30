package com.smartphoneai.auth;

import com.smartphoneai.service.OtpPolicy;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class OtpPolicyTest {
    private static final Instant ISSUED = Instant.parse("2026-10-30T03:00:00Z");

    @Test void otpExpiresAtFiveMinutes() {
        assertTrue(OtpPolicy.mayVerify(ISSUED, ISSUED.plusSeconds(299), 0, false));
        assertFalse(OtpPolicy.mayVerify(ISSUED, ISSUED.plusSeconds(300), 0, false));
    }

    @Test void otpLocksAfterFiveWrongAttemptsAndCannotBeReused() {
        assertTrue(OtpPolicy.mayVerify(ISSUED, ISSUED.plusSeconds(1), 4, false));
        assertFalse(OtpPolicy.mayVerify(ISSUED, ISSUED.plusSeconds(1), 5, false));
        assertFalse(OtpPolicy.mayVerify(ISSUED, ISSUED.plusSeconds(1), 0, true));
    }

    @Test void resendRequiresSixtySeconds() {
        assertFalse(OtpPolicy.mayResend(ISSUED, ISSUED.plusSeconds(59)));
        assertTrue(OtpPolicy.mayResend(ISSUED, ISSUED.plusSeconds(60)));
    }
}
