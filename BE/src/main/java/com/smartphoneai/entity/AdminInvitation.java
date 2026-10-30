package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_invitations")
public class AdminInvitation {
    @Id private UUID id;
    @Column(name = "user_id", nullable = false, unique = true) private UUID userId;
    @Column(name = "token_hash", nullable = false, unique = true) private String tokenHash;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean consumed;
    @Version private long version;
    protected AdminInvitation() {}
    public AdminInvitation(UUID userId, String tokenHash, Instant expiresAt) {
        this.id = UUID.randomUUID(); this.userId = userId; this.tokenHash = tokenHash; this.expiresAt = expiresAt;
    }
    public void replace(String tokenHash, Instant expiresAt) { this.tokenHash = tokenHash; this.expiresAt = expiresAt; this.consumed = false; }
    public boolean consume(Instant now) {
        if (consumed || !now.isBefore(expiresAt)) return false;
        consumed = true; return true;
    }
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public Instant getExpiresAt() { return expiresAt; }
}
