package com.smartphoneai.ai;

import com.smartphoneai.entity.AiBackupKey;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.*;
import com.smartphoneai.service.impl.*;
import com.smartphoneai.service.support.ConfigSecretCipher;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AiQuotaProviderTest {
    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings={"GROQ", "DEEPSEEK"})
    void proactivelyRotatesOtherProvidersWithoutChangingModel(String provider) {
        var configs = mock(AiProviderConfigRepository.class);
        var backups = mock(AiBackupKeyRepository.class);
        var cipher = mock(ConfigSecretCipher.class);
        var client = mock(UsageAwareChatProviderClient.class);
        var quota = mock(AiQuotaTracker.class);
        var config = mock(AiProviderConfig.class);
        var backup = mock(AiBackupKey.class);
        when(config.getId()).thenReturn(1L);
        when(config.getProvider()).thenReturn(provider);
        when(config.getModel()).thenReturn("selected-model");
        when(config.getKeyCipher()).thenReturn("primary");
        when(backup.getId()).thenReturn(2L);
        when(backup.getKeyCipher()).thenReturn("backup");
        when(backup.getName()).thenReturn("B");
        when(configs.findAllByActiveTrue()).thenReturn(List.of(config));
        when(backups.findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(backup));
        when(cipher.decrypt(eq(provider), anyString())).thenAnswer(call -> call.getArgument(1));
        UUID usageId = UUID.randomUUID();
        when(quota.reserve(eq(provider), anyList(), eq("selected-model"), eq("question"), anySet()))
                .thenReturn(new AiQuotaTracker.Reservation("2", usageId, "b", true));
        when(client.chatWithUsage(provider, "selected-model", "backup", "question"))
                .thenReturn(new UsageAwareChatProviderClient.Reply("answer", 15));
        var service = new AiProviderServiceImpl(configs, mock(SystemSettingRepository.class), cipher, client,
                Clock.systemUTC(), mock(AiKeyAlertService.class), backups);
        service.setQuota(quota);
        assertEquals("answer", service.chat("question"));
        verify(quota).finish(usageId, 15);
        verify(quota).recordSuccess(provider, "selected-model", AiQuotaTracker.fingerprint("backup"), true);
    }
    @Test void nearQuotaChoosesBackupAndRecordsProviderUsage() {
        var configs=mock(AiProviderConfigRepository.class); var backups=mock(AiBackupKeyRepository.class);
        var cipher=mock(ConfigSecretCipher.class); var client=mock(UsageAwareChatProviderClient.class);
        var alerts=mock(AiKeyAlertService.class); var quota=mock(AiQuotaTracker.class);
        var config=mock(AiProviderConfig.class); var backup=mock(AiBackupKey.class);
        when(config.getId()).thenReturn(1L); when(config.getProvider()).thenReturn("GEMINI");
        when(config.getModel()).thenReturn("model"); when(config.getKeyCipher()).thenReturn("primary");
        when(backup.getId()).thenReturn(3L); when(backup.getKeyCipher()).thenReturn("backup"); when(backup.getName()).thenReturn("Project B");
        when(configs.findAllByActiveTrue()).thenReturn(List.of(config));
        when(backups.findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(backup));
        when(cipher.decrypt(eq("GEMINI"),anyString())).thenAnswer(inv->inv.getArgument(1));
        when(quota.configured()).thenReturn(true);
        UUID usageId=UUID.randomUUID();
        when(quota.reserve(anyList(),eq("model"),eq("question"),anySet()))
                .thenReturn(new AiQuotaTracker.Reservation("3",usageId,"project-b",true));
        when(client.chatWithUsage("GEMINI","model","backup","question"))
                .thenReturn(new UsageAwareChatProviderClient.Reply("OK",123));
        var service=new AiProviderServiceImpl(configs,mock(SystemSettingRepository.class),cipher,client,Clock.systemUTC(),alerts,backups);
        service.setQuota(quota);
        assertEquals("OK",service.chat("question"));
        verify(quota).finish(usageId,123);
        verify(alerts).record(1L,"USING_BACKUP","AI_QUOTA_NEAR_LIMIT",null,"Project B");
        verify(client,never()).chatWithUsage(eq("GEMINI"),eq("model"),eq("primary"),anyString());
    }
    @Test void rateLimitExcludesSharedProjectButAuthenticationErrorDoesNot() {
        for (int status:List.of(429,401)) {
            var configs=mock(AiProviderConfigRepository.class); var backups=mock(AiBackupKeyRepository.class);
            var cipher=mock(ConfigSecretCipher.class); var client=mock(ChatProviderClient.class);
            var alerts=mock(AiKeyAlertService.class); var quota=mock(AiQuotaTracker.class);
            var config=mock(AiProviderConfig.class); var backup=mock(AiBackupKey.class);
            when(config.getId()).thenReturn(1L); when(config.getProvider()).thenReturn("GEMINI");
            when(config.getModel()).thenReturn("model"); when(config.getKeyCipher()).thenReturn("primary");
            when(backup.getId()).thenReturn(3L); when(backup.getKeyCipher()).thenReturn("backup"); when(backup.getName()).thenReturn("B");
            when(configs.findAllByActiveTrue()).thenReturn(List.of(config)); when(backups.findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(backup));
            when(cipher.decrypt(eq("GEMINI"),anyString())).thenAnswer(inv->inv.getArgument(1)); when(quota.configured()).thenReturn(true);
            when(quota.reserve(anyList(),eq("model"),eq("question"),anySet()))
                    .thenReturn(new AiQuotaTracker.Reservation("PRIMARY",UUID.randomUUID(),"shared",false))
                    .thenReturn(new AiQuotaTracker.Reservation("3",UUID.randomUUID(),"shared",false));
            when(client.chat("GEMINI","model","primary","question")).thenThrow(new AiProviderException(status));
            when(client.chat("GEMINI","model","backup","question")).thenReturn("OK");
            var service=new AiProviderServiceImpl(configs,mock(SystemSettingRepository.class),cipher,client,Clock.systemUTC(),alerts,backups);
            service.setQuota(quota);
            assertEquals("OK",service.chat("question"));
            verify(quota,atLeastOnce()).reserve(anyList(),eq("model"),eq("question"),argThat(set -> status==429 ? set.contains("shared") : set.isEmpty()));
        }
    }
    @Test void notifiesAdminIfProactivelySelectedBackupIsUnavailable() {
        var configs=mock(AiProviderConfigRepository.class); var backups=mock(AiBackupKeyRepository.class);
        var cipher=mock(ConfigSecretCipher.class); var client=mock(ChatProviderClient.class);
        var alerts=mock(AiKeyAlertService.class); var quota=mock(AiQuotaTracker.class);
        var config=mock(AiProviderConfig.class); var backup=mock(AiBackupKey.class);
        when(config.getId()).thenReturn(1L); when(config.getProvider()).thenReturn("GEMINI");
        when(config.getModel()).thenReturn("model"); when(config.getKeyCipher()).thenReturn("primary");
        when(backup.getId()).thenReturn(3L); when(backup.getKeyCipher()).thenReturn("backup"); when(backup.getName()).thenReturn("B");
        when(configs.findAllByActiveTrue()).thenReturn(List.of(config)); when(backups.findAllByConfigIdOrderByPriorityAsc(1L)).thenReturn(List.of(backup));
        when(cipher.decrypt(eq("GEMINI"),anyString())).thenAnswer(inv->inv.getArgument(1)); when(quota.configured()).thenReturn(true);
        when(quota.reserve(anyList(),eq("model"),eq("question"),anySet()))
                .thenReturn(new AiQuotaTracker.Reservation("3",UUID.randomUUID(),"other",true));
        when(client.chat("GEMINI","model","backup","question")).thenThrow(new AiProviderException(503));
        var service=new AiProviderServiceImpl(configs,mock(SystemSettingRepository.class),cipher,client,Clock.systemUTC(),alerts,backups);
        service.setQuota(quota);
        assertThrows(AiProviderException.class,()->service.chat("question"));
        verify(alerts).record(1L,"BACKUP_FAILED","AI_QUOTA_NEAR_LIMIT","AI_PROVIDER_BUSY","B");
    }
}
