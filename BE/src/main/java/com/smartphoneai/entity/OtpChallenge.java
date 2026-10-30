package com.smartphoneai.entity;

import com.smartphoneai.service.OtpPolicy;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "otp_challenges")
public class OtpChallenge {
    public enum Result { SUCCESS, INVALID, UNAVAILABLE }

    @Id private UUID id;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private String purpose;
    @Column(name = "code_hash", nullable = false) private String codeHash;
    @Column(name = "issued_at", nullable = false) private Instant issuedAt;
    @Column(name = "failed_attempts", nullable = false) private int failedAttempts;
    @Column(nullable = false) private boolean consumed;
    @Column(nullable = false) private boolean deliverable;
    @Version private long version;

    protected OtpChallenge() {}

    public OtpChallenge(String email, String purpose, String codeHash, Instant issuedAt) {
        this(email, purpose, codeHash, issuedAt, true);
    }
    public OtpChallenge(String email, String purpose, String codeHash, Instant issuedAt, boolean deliverable) {
        this.id = UUID.randomUUID();
        this.email = email;
        this.purpose = purpose;
        this.codeHash = codeHash;
        this.issuedAt = issuedAt;
        this.deliverable = deliverable;
    }

    public Result verify(boolean matches, Instant now) {
        if (!OtpPolicy.mayVerify(issuedAt, now, failedAttempts, consumed)) return Result.UNAVAILABLE;
        if (!matches) { failedAttempts++; return Result.INVALID; }
        consumed = true;
        return Result.SUCCESS;
    }

    public boolean replaceCode(String newCodeHash, Instant now) {
        if (consumed || !OtpPolicy.mayResend(issuedAt, now)) return false;
        codeHash = newCodeHash;
        issuedAt = now;
        failedAttempts = 0;
        return true;
    }

    public UUID getId() { return id; }
    public void invalidate() { consumed = true; }
    public String getEmail() { return email; }
    public String getPurpose() { return purpose; }
    public String getCodeHash() { return codeHash; }
    public Instant getIssuedAt() { return issuedAt; }
    public int getFailedAttempts() { return failedAttempts; }
    public boolean isDeliverable() { return deliverable; }
}
