package com.smartphoneai.auth;

import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.service.OtpChallengeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class OtpPersistenceTest {
    @Autowired OtpChallengeRepository repository;
    @Autowired TestEntityManager entityManager;

    @Test void persistsHashAttemptsAndConsumedState() {
        var code = new AtomicReference<String>();
        var service = new OtpChallengeService(repository, (email, value) -> code.set(value),
                new BCryptPasswordEncoder(4), Clock.fixed(Instant.parse("2026-10-30T03:00:00Z"), ZoneOffset.UTC));
        var id = service.issue("A@example.com", "LOGIN").getId();
        entityManager.flush(); entityManager.clear();
        assertEquals(OtpChallenge.Result.INVALID, service.verify(id, "LOGIN", "not-the-code"));
        entityManager.flush(); entityManager.clear();
        assertEquals(1, repository.findById(id).orElseThrow().getFailedAttempts());
        assertEquals(OtpChallenge.Result.SUCCESS, service.verify(id, "LOGIN", code.get()));
        entityManager.flush(); entityManager.clear();
        assertEquals(OtpChallenge.Result.UNAVAILABLE, service.verify(id, "LOGIN", code.get()));
    }
}
