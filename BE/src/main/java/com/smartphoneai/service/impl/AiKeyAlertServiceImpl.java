package com.smartphoneai.service.impl;

import com.smartphoneai.dto.response.AiKeyAlertResponse;
import com.smartphoneai.dto.response.AiNotificationItemResponse;
import com.smartphoneai.dto.response.AiNotificationsResponse;
import com.smartphoneai.entity.AiKeyAlert;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiKeyAlertRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AiKeyAlertService;
import com.smartphoneai.service.support.AiProviders;
import java.time.Clock;
import java.util.Objects;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiKeyAlertServiceImpl implements AiKeyAlertService {
    private final AiKeyAlertRepository alerts;
    private final AiProviderConfigRepository configs;
    private final AiBackupKeyRepository backupKeys;
    private final UserAccountRepository users;
    private final Clock clock;

    public AiKeyAlertServiceImpl(AiKeyAlertRepository alerts, AiProviderConfigRepository configs,
                                 AiBackupKeyRepository backupKeys, UserAccountRepository users, Clock clock) {
        this.alerts = alerts;
        this.configs = configs;
        this.backupKeys = backupKeys;
        this.users = users;
        this.clock = clock;
    }

    @Override
    @Async("aiKeyAlertExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Long configId, String status, String reason, String backupFailureReason) {
        recordTransition(configId, status, reason, backupFailureReason, null);
    }

    @Override
    @Async("aiKeyAlertExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Long configId, String status, String reason, String backupFailureReason, String backupKeyName) {
        recordTransition(configId, status, reason, backupFailureReason, backupKeyName);
    }

    private void recordTransition(Long configId, String status, String reason, String backupFailureReason, String backupKeyName) {
        // Serialize transitions for this configuration so concurrent chats share one warning.
        if (configs.findLockedById(configId).isEmpty()) return;
        var previous = alerts.findFirstByConfigIdOrderByIdDesc(configId);
        if (previous.isEmpty() && "PRIMARY".equals(status)) return;
        if (previous.isPresent() && previous.get().getStatus().equals(status)
                && Objects.equals(previous.get().getReason(), reason)
                && Objects.equals(previous.get().getBackupFailureReason(), backupFailureReason)
                && Objects.equals(previous.get().getBackupKeyName(), backupKeyName)) return;
        alerts.save(new AiKeyAlert(configId, status, reason, backupFailureReason, backupKeyName, clock.instant()));
    }

    @Override
    @Async("aiKeyAlertExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordBackupAttempt(Long keyId, String failureReason) {
        backupKeys.findById(keyId).ifPresent(key -> key.recordOutcome(failureReason, clock.instant()));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AiKeyAlertResponse> current() {
        return configs.findAllByActiveTrue().stream().filter(config -> AiProviders.isChatProvider(config.getProvider()))
                .findFirst().flatMap(config -> alerts.findFirstByConfigIdOrderByIdDesc(config.getId())
                        .filter(alert -> !"PRIMARY".equals(alert.getStatus()))
                        .map(alert -> new AiKeyAlertResponse(alert.getId().toString(), config.getModel(), alert.getStatus(),
                                alert.getReason(), alert.getBackupFailureReason(), alert.getDetectedAt(), alert.getBackupKeyName())));
    }

    @Override
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public AiNotificationsResponse history(UUID userId) {
        var user = users.findById(userId).orElseThrow(InvalidCredentialsException::new);
        var latestId = alerts.findLatestChatAlertId();
        if (latestId == null) return new AiNotificationsResponse(List.of(), 0, null);
        var history = alerts.findChatAlertHistory(latestId, PageRequest.of(0, 50));
        var configIds = history.stream().map(AiKeyAlert::getConfigId).distinct().toList();
        var configurations = configs.findAllById(configIds).stream()
                .collect(Collectors.toMap(AiProviderConfig::getId, Function.identity()));
        var recoveredThroughIds = alerts.findLatestRecoveriesForConfigs(configIds, latestId).stream()
                .collect(Collectors.toMap(AiKeyAlert::getConfigId, AiKeyAlert::getId));
        var items = history.stream().map(alert -> {
            var configuration = configurations.get(alert.getConfigId());
            boolean resolved = !configuration.isActive()
                    || alert.getId() <= recoveredThroughIds.getOrDefault(alert.getConfigId(), 0L);
            return new AiNotificationItemResponse(alert.getId().toString(), configuration.getModel(), alert.getStatus(),
                    alert.getReason(), alert.getBackupFailureReason(), alert.getDetectedAt(), alert.getBackupKeyName(),
                    alert.getId() <= user.getAiNotificationsReadThroughId(), resolved);
        }).toList();
        return new AiNotificationsResponse(items, alerts.countUnreadChatAlerts(user.getAiNotificationsReadThroughId(), latestId),
                latestId.toString());
    }

    @Override
    @Transactional
    public void markRead(UUID userId, long throughId) {
        var user = users.findLockedById(userId).orElseThrow(InvalidCredentialsException::new);
        var latestId = alerts.findLatestChatAlertId();
        if (latestId != null) user.markAiNotificationsReadThrough(Math.min(throughId, latestId));
    }
}
