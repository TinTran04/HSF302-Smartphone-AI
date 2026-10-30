package com.smartphoneai.auth;

import com.smartphoneai.entity.OtpChallenge;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class OtpChallengeTest {
    private static final Instant START = Instant.parse("2026-10-30T03:00:00Z");

    @Test void successfulVerificationConsumesChallenge() {
        var challenge = new OtpChallenge("a@example.com", "LOGIN", "hashed", START);
        assertEquals(OtpChallenge.Result.SUCCESS, challenge.verify(true, START.plusSeconds(1)));
        assertEquals(OtpChallenge.Result.UNAVAILABLE, challenge.verify(true, START.plusSeconds(2)));
    }

    @Test void fiveWrongAttemptsLockChallengeEvenIfNextCodeIsCorrect() {
        var challenge = new OtpChallenge("a@example.com", "LOGIN", "hashed", START);
        for (int i = 0; i < 5; i++)
            assertEquals(OtpChallenge.Result.INVALID, challenge.verify(false, START.plusSeconds(1)));
        assertEquals(OtpChallenge.Result.UNAVAILABLE, challenge.verify(true, START.plusSeconds(2)));
        assertEquals(5, challenge.getFailedAttempts());
    }

    @Test void expiredCodeCannotBeUsed() {
        var challenge = new OtpChallenge("a@example.com", "LOGIN", "hashed", START);
        assertEquals(OtpChallenge.Result.UNAVAILABLE, challenge.verify(true, START.plusSeconds(300)));
    }

    @Test void resendReplacesCodeAndResetsAttemptsAfterCooldown() {
        var challenge = new OtpChallenge("a@example.com", "LOGIN", "old", START);
        challenge.verify(false, START.plusSeconds(1));
        assertFalse(challenge.replaceCode("new", START.plusSeconds(59)));
        assertEquals("old", challenge.getCodeHash());
        assertTrue(challenge.replaceCode("new", START.plusSeconds(60)));
        assertEquals("new", challenge.getCodeHash());
        assertEquals(0, challenge.getFailedAttempts());
        assertEquals(START.plusSeconds(60), challenge.getIssuedAt());
    }
}
