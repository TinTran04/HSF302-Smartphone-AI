package com.smartphoneai.dto.response;

import java.time.Instant;

public record AiNotificationItemResponse(String id, String model, String status, String reason,
                                         String backupFailureReason, Instant detectedAt, String backupKeyName,
                                         boolean read, boolean resolved) {}
