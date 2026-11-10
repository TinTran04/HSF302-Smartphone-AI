package com.smartphoneai.dto.response;

import com.smartphoneai.entity.AiBackupKey;
import java.time.Instant;

public record AiBackupKeyResponse(String id, String name, String maskedKey, int priority,
                                  String lastStatus, String lastFailureReason, Instant lastCheckedAt) {
    public static AiBackupKeyResponse from(AiBackupKey key) {
        return new AiBackupKeyResponse(key.getId().toString(), key.getName(), key.getMaskedKey(), key.getPriority(),
                key.getLastStatus(), key.getLastFailureReason(), key.getLastCheckedAt());
    }
}
