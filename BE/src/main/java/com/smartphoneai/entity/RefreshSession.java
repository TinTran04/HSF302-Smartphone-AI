package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_sessions")
public class RefreshSession {
    @Id private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "token_hash", nullable = false, unique = true, length = 64) private String tokenHash;
    @Column(name = "credential_version", nullable = false) private long credentialVersion;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private UserAccount.Role role;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "expires_at", nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean revoked;

    protected RefreshSession() {}
    public RefreshSession(UserAccount user, String tokenHash, Instant now, Instant expiresAt) {
        this.id = UUID.randomUUID();
        this.userId = user.getId();
        this.createdAt = now;
        rotate(user, tokenHash, expiresAt);
    }
    public void rotate(UserAccount user, String tokenHash, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.credentialVersion = user.getCredentialVersion();
        this.role = user.getRole();
        this.expiresAt = expiresAt;
    }
    public void revoke() { revoked = true; }
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTokenHash() { return tokenHash; }
    public long getCredentialVersion() { return credentialVersion; }
    public UserAccount.Role getRole() { return role; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
}
