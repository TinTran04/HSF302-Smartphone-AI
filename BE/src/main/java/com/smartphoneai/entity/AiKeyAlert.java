package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_key_alerts")
public class AiKeyAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "config_id", nullable = false) private Long configId;
    @Column(nullable = false, length = 32) private String status;
    @Column(length = 64) private String reason;
    @Column(name = "backup_failure_reason", length = 64) private String backupFailureReason;
    @Column(name = "backup_key_name", length = 80) private String backupKeyName;
    @Column(name = "detected_at", nullable = false) private Instant detectedAt;

    protected AiKeyAlert() {}

    public AiKeyAlert(Long configId, String status, String reason, String backupFailureReason, Instant detectedAt) {
        this(configId, status, reason, backupFailureReason, null, detectedAt);
    }

    public AiKeyAlert(Long configId, String status, String reason, String backupFailureReason,
                      String backupKeyName, Instant detectedAt) {
        this.configId = configId;
        this.status = status;
        this.reason = reason;
        this.backupFailureReason = backupFailureReason;
        this.backupKeyName = backupKeyName;
        this.detectedAt = detectedAt;
    }

    public Long getId() { return id; }
    public Long getConfigId() { return configId; }
    public String getStatus() { return status; }
    public String getReason() { return reason; }
    public String getBackupFailureReason() { return backupFailureReason; }
    public String getBackupKeyName() { return backupKeyName; }
    public Instant getDetectedAt() { return detectedAt; }
}
