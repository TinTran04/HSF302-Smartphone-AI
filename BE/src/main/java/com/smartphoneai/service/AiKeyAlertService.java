package com.smartphoneai.service;

import com.smartphoneai.dto.response.AiKeyAlertResponse;
import com.smartphoneai.dto.response.AiNotificationsResponse;
import java.util.Optional;
import java.util.UUID;

public interface AiKeyAlertService {
    void record(Long configId, String status, String reason, String backupFailureReason);
    default void record(Long configId, String status, String reason, String backupFailureReason, String backupKeyName) {
        record(configId, status, reason, backupFailureReason);
    }
    void recordBackupAttempt(Long keyId, String failureReason);
    Optional<AiKeyAlertResponse> current();
    AiNotificationsResponse history(UUID userId);
    void markRead(UUID userId, long throughId);
}
