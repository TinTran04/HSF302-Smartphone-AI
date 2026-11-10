package com.smartphoneai.dto.response;

import java.time.Instant;

public record AiKeyAlertResponse(String id, String model, String status, String reason,
                                 String backupFailureReason, Instant detectedAt, String backupKeyName) {
    public AiKeyAlertResponse(String id, String model, String status, String reason,
                              String backupFailureReason, Instant detectedAt) {
        this(id, model, status, reason, backupFailureReason, detectedAt, null);
    }
}
