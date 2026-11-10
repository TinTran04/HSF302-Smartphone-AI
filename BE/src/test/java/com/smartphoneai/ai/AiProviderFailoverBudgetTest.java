package com.smartphoneai.ai;

import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.AiBackupKeyRepository;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.AiKeyAlertService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.impl.AiProviderServiceImpl;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AiProviderFailoverBudgetTest {
    @Test void stopsStartingFurtherBackupCallsAfterTheFailoverWindow() {
        var configs = mock(AiProviderConfigRepository.class);
        var backups = mock(AiBackupKeyRepository.class);
        var cipher = mock(ConfigSecretCipher.class);
        var provider = mock(ChatProviderClient.class);
        var alerts = mock(AiKeyAlertService.class);
        var clock = mock(Clock.class);
        var start = Instant.parse("2026-11-09T12:00:00Z");
        var now = new AtomicReference<>(start);
        when(clock.instant()).thenAnswer(call -> now.get());
        var configuration = mock(AiProviderConfig.class);
        when(configuration.getId()).thenReturn(1L);
        when(configuration.getProvider()).thenReturn("GEMINI");
        when(configuration.getModel()).thenReturn("model");
        when(configuration.getKeyCipher()).thenReturn("primary-cipher");
        when(configs.findAllByActiveTrue()).thenReturn(List.of(configuration));
        when(backups.findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(
                new AiBackupKey(1L, "Backup A", 1, "cipher-a", "masked"),
                new AiBackupKey(1L, "Backup B", 2, "cipher-b", "masked")));
        when(cipher.decrypt(eq("GEMINI"), anyString())).thenAnswer(call -> call.getArgument(1));
        when(provider.chat("GEMINI", "model", "primary-cipher", "question")).thenThrow(new AiProviderException(401));
        var quotaFailure = new AiProviderException(429);
        when(provider.chat("GEMINI", "model", "cipher-a", "question")).thenAnswer(call -> {
            now.set(start.plusSeconds(61));
            throw quotaFailure;
        });
        var service = new AiProviderServiceImpl(configs, mock(SystemSettingRepository.class), cipher, provider, clock, alerts, backups);
        assertSame(quotaFailure, assertThrows(AiProviderException.class, () -> service.chat("question")));
        verify(provider, never()).chat("GEMINI", "model", "cipher-b", "question");
        verify(alerts).record(1L, "BACKUP_FAILED", "AI_PROVIDER_AUTH_ERROR", "AI_PROVIDER_RATE_LIMIT", "Backup A");
    }
}
