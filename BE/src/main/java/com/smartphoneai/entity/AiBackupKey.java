package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_backup_keys")
public class AiBackupKey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "config_id", nullable = false) private Long configId;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false) private int priority;
    @Column(name = "key_cipher", nullable = false, columnDefinition = "text") private String keyCipher;
    @Column(name = "masked_key", nullable = false, length = 32) private String maskedKey;
    @Column(name = "last_status", nullable = false, length = 32) private String lastStatus = "UNKNOWN";
    @Column(name = "last_failure_reason", length = 64) private String lastFailureReason;
    @Column(name = "last_checked_at") private Instant lastCheckedAt;

    protected AiBackupKey() {}
    public AiBackupKey(Long configId, String name, int priority, String keyCipher, String maskedKey) {
        this.configId = configId;
        this.name = name;
        this.priority = priority;
        this.keyCipher = keyCipher;
        this.maskedKey = maskedKey;
    }
    public void recordOutcome(String failureReason, Instant at) {
        lastFailureReason = failureReason;
        lastCheckedAt = at;
        if (failureReason == null) lastStatus = "WORKING";
        else if ("AI_PROVIDER_AUTH_ERROR".equals(failureReason) || "AI_PROVIDER_RATE_LIMIT".equals(failureReason)) lastStatus = "KEY_ERROR";
        else lastStatus = "PROVIDER_ERROR";
    }
    public Long getId() { return id; }
    public Long getConfigId() { return configId; }
    public String getName() { return name; }
    public int getPriority() { return priority; }
    public String getKeyCipher() { return keyCipher; }
    public String getMaskedKey() { return maskedKey; }
    public String getLastStatus() { return lastStatus; }
    public String getLastFailureReason() { return lastFailureReason; }
    public Instant getLastCheckedAt() { return lastCheckedAt; }
}
