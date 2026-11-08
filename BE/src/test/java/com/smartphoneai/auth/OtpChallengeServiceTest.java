package com.smartphoneai.auth;

import com.smartphoneai.service.impl.OtpChallengeServiceImpl;

import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OtpChallengeServiceTest {
    @Test void loginChallengesCannotBeIssuedVerifiedOrResent() {
        var repository = mock(OtpChallengeRepository.class);
        var now = Instant.parse("2026-10-30T03:05:00Z");
        var encoder = new BCryptPasswordEncoder(4);
        var legacy = new OtpChallenge("a@example.com", "LOGIN", encoder.encode("123456"), now.minusSeconds(60));
        when(repository.findLockedById(legacy.getId())).thenReturn(Optional.of(legacy));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var service = new OtpChallengeServiceImpl(repository, (email, code) -> {}, encoder, Clock.fixed(now, ZoneOffset.UTC));
        assertThrows(IllegalArgumentException.class, () -> service.issue("a@example.com", "LOGIN"));
        assertEquals(OtpChallenge.Result.UNAVAILABLE, service.verify(legacy.getId(), "LOGIN", "123456"));
        assertFalse(service.resend(legacy.getId()));
    }

    @Test void issuingReplacementInvalidatesOlderChallenge() {
        var repository = mock(OtpChallengeRepository.class);
        var now = Instant.parse("2026-10-30T03:05:00Z");
        var previous = new OtpChallenge("a@example.com", "REGISTER", "oldhash", now.minusSeconds(60));
        when(repository.findFirstByEmailAndPurposeOrderByIssuedAtDesc("a@example.com", "REGISTER"))
                .thenReturn(Optional.of(previous));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var service = new OtpChallengeServiceImpl(repository, (email, code) -> {}, new BCryptPasswordEncoder(4),
                Clock.fixed(now, ZoneOffset.UTC));
        service.issue("a@example.com", "REGISTER");
        assertEquals(OtpChallenge.Result.UNAVAILABLE, previous.verify(true, now));
    }
    @Test void issueStoresOnlyHashAndVerifyConsumesCode() {
        var repository = mock(OtpChallengeRepository.class);
        var sentCode = new AtomicReference<String>();
        OtpSender sender = (email, code) -> sentCode.set(code);
        var now = Instant.parse("2026-10-30T03:00:00Z");
        var service = new OtpChallengeServiceImpl(repository, sender, new BCryptPasswordEncoder(4),
                Clock.fixed(now, ZoneOffset.UTC));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var challenge = service.issue("a@example.com", "REGISTER");
        when(repository.findLockedById(challenge.getId())).thenReturn(Optional.of(challenge));
        assertTrue(sentCode.get().matches("\\d{6}"));
        assertNotEquals(sentCode.get(), challenge.getCodeHash());
        assertEquals(OtpChallenge.Result.UNAVAILABLE, service.verify(challenge.getId(), "PASSWORD_RESET", sentCode.get()));
        assertEquals(OtpChallenge.Result.SUCCESS, service.verify(challenge.getId(), "REGISTER", sentCode.get()));
        assertEquals(OtpChallenge.Result.UNAVAILABLE, service.verify(challenge.getId(), "REGISTER", sentCode.get()));
    }
}
