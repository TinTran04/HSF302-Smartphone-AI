package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="ai_guest_sessions")
public class AiGuestSession {
    @Id private UUID id;
    @Column(name="token_hash", nullable=false, unique=true, length=64) private String tokenHash;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Column(name="expires_at", nullable=false) private Instant expiresAt;
    @Column(name="message_count", nullable=false) private int messageCount;
    @Column(nullable=false) private boolean revoked;
    @Version private long version;
    protected AiGuestSession() {}
    public AiGuestSession(String tokenHash, Instant now) { id=UUID.randomUUID(); this.tokenHash=tokenHash; createdAt=now; expiresAt=now.plusSeconds(86400); }
    public UUID getId() { return id; } public int getMessageCount() { return messageCount; }
    public boolean validAt(Instant now) { return !revoked && now.isBefore(expiresAt); }
    public void countMessage() { messageCount++; }
    public void revoke() { revoked=true; }
}
