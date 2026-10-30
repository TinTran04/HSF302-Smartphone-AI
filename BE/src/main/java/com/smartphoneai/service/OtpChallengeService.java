package com.smartphoneai.service;

import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.exception.OtpRateLimitException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class OtpChallengeService {
    private static final Set<String> PURPOSES = Set.of("REGISTER", "LOGIN", "PASSWORD_RESET");
    private final SecureRandom random = new SecureRandom();
    private final OtpChallengeRepository repository;
    private final OtpSender sender;
    private final PasswordEncoder encoder;
    private final Clock clock;

    public OtpChallengeService(OtpChallengeRepository repository, OtpSender sender, PasswordEncoder encoder, Clock clock) {
        this.repository = repository; this.sender = sender; this.encoder = encoder; this.clock = clock;
    }

    @Transactional
    public OtpChallenge issue(String email, String purpose) {
        return issue(email, purpose, true);
    }

    @Transactional
    public OtpChallenge issue(String email, String purpose, boolean deliverable) {
        if (email == null || email.isBlank() || !PURPOSES.contains(purpose)) throw new IllegalArgumentException("Invalid challenge");
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        var latest = repository.findFirstByEmailAndPurposeOrderByIssuedAtDesc(normalizedEmail, purpose);
        if (latest.isPresent() && !OtpPolicy.mayResend(latest.get().getIssuedAt(), clock.instant()))
            throw new OtpRateLimitException();
        latest.ifPresent(OtpChallenge::invalidate);
        String code = newCode();
        var challenge = repository.save(new OtpChallenge(normalizedEmail, purpose,
                encoder.encode(code), clock.instant(), deliverable));
        if (deliverable) sender.send(challenge.getEmail(), code);
        return challenge;
    }

    @Transactional
    public OtpChallenge.Result verify(UUID id, String purpose, String code) {
        var challenge = repository.findLockedById(id).orElse(null);
        if (challenge == null || !challenge.getPurpose().equals(purpose)) return OtpChallenge.Result.UNAVAILABLE;
        boolean matches = code != null && encoder.matches(code, challenge.getCodeHash());
        return challenge.verify(matches, clock.instant());
    }

    @Transactional
    public boolean resend(UUID id) {
        var challenge = repository.findLockedById(id).orElse(null);
        if (challenge == null) return false;
        String code = newCode();
        if (!challenge.replaceCode(encoder.encode(code), clock.instant())) return false;
        if (challenge.isDeliverable()) sender.send(challenge.getEmail(), code);
        return true;
    }

    private String newCode() { return String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000)); }
}
