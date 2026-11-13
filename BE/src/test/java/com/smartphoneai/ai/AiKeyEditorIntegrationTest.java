package com.smartphoneai.ai;

import com.smartphoneai.service.*;
import com.smartphoneai.service.impl.*;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.exception.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:keyeditor;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa","spring.datasource.password=",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
class AiKeyEditorIntegrationTest {
    @Autowired AiKeyEditorService editor;
    @Autowired AiKeyManagementService keys;
    @Autowired AiQuotaSettingsService quota;
    @Autowired AiProviderConfigRepository configs;
    @Autowired com.smartphoneai.repository.AiBackupKeyRepository backups;
    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean AiActivityLogService activity;
    @Autowired AiQuotaTracker tracker;
    @Autowired AiProviderService providers;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactions;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @MockitoBean ChatProviderClient client;
    @MockitoBean OtpSender otp;

    @org.junit.jupiter.api.BeforeEach void resetConfigurations() { backups.deleteAll(); configs.deleteAll(); }

    @Test void auditForAnAdminMutationCommitsTogetherWithTheMutation() {
        String operation = "rollback-" + java.util.UUID.randomUUID();
        var transaction = new org.springframework.transaction.support.TransactionTemplate(transactions);
        assertThrows(IllegalStateException.class, () -> transaction.executeWithoutResult(status -> {
            activity.record("GEMINI", "model", "KEY_REMOVED", operation, "masked", null, "Admin");
            throw new IllegalStateException("mutation rejected");
        }));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM ai_activity_log WHERE key_name=?", Integer.class, operation));
    }

    @Test void keyEditingRollsBackIfItsAuditCannotBeSaved() {
        when(client.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        var created = editor.edit(new AiKeyEditorService.EditRequest("GEMINI", null, "custom-model", null,
                "Original", "audit-original-secret", null, null, true));
        long count = configs.count();
        doThrow(new IllegalStateException("audit storage failed")).when(activity).record(eq("GEMINI"),
                anyString(), anyString(), anyString(), anyString(), nullable(String.class), anyString());
        assertThrows(IllegalStateException.class, () -> editor.edit(new AiKeyEditorService.EditRequest("GEMINI",
                Long.valueOf(created.id()), created.model(), "PRIMARY", "Changed", "audit-new-secret", null, null, true)));
        assertEquals(count, configs.count());
        assertEquals(created.id(), keys.get("GEMINI").configId());
        assertEquals("Original", keys.get("GEMINI").keys().getFirst().name());
    }

    @Test void dailyUsageCountsEveryRetryAndRunsTheProviderOutsideTransactions() {
        when(client.chat(anyString(), anyString(), anyString(), anyString())).thenAnswer(call -> {
            assertFalse(TransactionSynchronizationManager.isActualTransactionActive());
            return "OK";
        });
        var created = editor.edit(new AiKeyEditorService.EditRequest("GEMINI", null, "gemini-3.5-flash-lite",
                null, "Primary", "daily-counter-secret", "daily-project", null, true, 500L, false));
        providers.activate("GEMINI", Long.valueOf(created.id()));
        long before = quota.get("GEMINI", null).keys().getFirst().requestsToday();
        assertEquals(1, before);
        when(client.chat(eq("GEMINI"), anyString(), anyString(), eq("Retry question")))
                .thenThrow(new AiProviderException(503)).thenAnswer(call -> {
                    assertFalse(TransactionSynchronizationManager.isActualTransactionActive());
                    return "Answer";
                });
        assertEquals("Answer", providers.chat("Retry question"));
        var usage = quota.get("GEMINI", null).keys().getFirst();
        assertEquals(before + 2, usage.requestsToday());
        assertEquals(500L, usage.dailyRequestLimit());
        assertEquals("MANUAL", usage.dailyLimitSource());
    }

    @ParameterizedTest @ValueSource(strings={"GEMINI","GROQ","DEEPSEEK"})
    void editsKeyAndQuotaTogetherAndRejectsStaleWrites(String provider) {
        when(client.chat(eq(provider),anyString(),anyString(),anyString())).thenAnswer(call -> {
            assertFalse(TransactionSynchronizationManager.isActualTransactionActive());
            return "OK";
        });
        var created = editor.edit(new AiKeyEditorService.EditRequest(provider,null,"custom-model",null,"Main",
                "private-primary-AAAA","group-a",500000L,false));
        var primary = keys.get(provider).keys().getFirst();
        assertEquals("Main", primary.name());
        assertEquals(500000L, quota.get(provider,null).keys().getFirst().tpmLimit());
        var withBackup = editor.edit(new AiKeyEditorService.EditRequest(provider,Long.valueOf(created.id()),"custom-model",
                null,"Backup","private-backup-BBBB","group-b",800000L,false));
        assertEquals(2,keys.get(provider).keys().size());
        assertThrows(InvalidAiConfigurationException.class,() -> editor.edit(new AiKeyEditorService.EditRequest(provider,
                Long.valueOf(created.id()),"custom-model","PRIMARY","Stale",null,"a",1L,false)));
        long current = Long.parseLong(withBackup.id());
        when(client.chat(provider,"custom-model","rejected-key","Reply with OK.")).thenThrow(new AiProviderException(401));
        assertThrows(AiProviderException.class,() -> editor.edit(new AiKeyEditorService.EditRequest(provider,current,
                "custom-model","PRIMARY","Bad","rejected-key","bad",1L,false)));
        assertEquals(withBackup.id(),keys.get(provider).configId());
        assertEquals("Main",keys.get(provider).keys().getFirst().name());
    }

    @Test void pagesNewestActivityInTenRows() {
        for (int index=0;index<23;index++) activity.record("GEMINI","model","KEY_EDITED","key", "••••AAAA",null,"admin");
        var first = activity.get("GEMINI",0,10);
        assertEquals(10,first.items().size());
        assertEquals(10,activity.get("GEMINI",1,10).items().size());
        assertTrue(activity.get("GEMINI",2,10).items().size()>=3);
        assertTrue(first.total()>=23);
        assertThrows(InvalidAiConfigurationException.class,()->activity.get("GEMINI",-1,10));
    }

    @Test void replacingSecretCanKeepTheExistingDisplayName() {
        when(client.chat(anyString(),anyString(),anyString(),anyString())).thenReturn("OK");
        var saved=editor.edit(new AiKeyEditorService.EditRequest("GROQ",null,"model","PRIMARY","Keep name",
                "old-private-AAAA","old-group",12000L,false));
        var replaced=editor.edit(new AiKeyEditorService.EditRequest("GROQ",Long.valueOf(saved.id()),"model","PRIMARY","Keep name",
                "new-private-BBBB","new-group",24000L,false));
        assertEquals("Keep name",keys.get("GROQ").keys().getFirst().name());
        assertEquals(replaced.id(),keys.get("GROQ").configId());
        assertEquals("new-group",quota.get("GROQ",null).keys().getFirst().projectName());
        assertEquals(24000L,quota.get("GROQ",null).keys().getFirst().tpmLimit());
    }

    @Test void reusingAKnownSecretRestoresItsSavedGroupAndManualQuota() {
        when(client.chat(anyString(),anyString(),anyString(),anyString())).thenReturn("OK");
        var first=editor.edit(new AiKeyEditorService.EditRequest("GROQ",null,"model",null,"Main",
                "known-private-AAAA","remembered-group",500000L,false));
        var second=editor.edit(new AiKeyEditorService.EditRequest("GROQ",Long.valueOf(first.id()),"model","PRIMARY","Main",
                "other-private-BBBB","other-group",100000L,false));
        editor.edit(new AiKeyEditorService.EditRequest("GROQ",Long.valueOf(second.id()),"model","PRIMARY","Main",
                "known-private-AAAA",null,null,true));
        var restored=quota.get("GROQ",null).keys().getFirst();
        assertEquals("remembered-group",restored.projectName());
        assertEquals(500000L,restored.tpmLimit());
        assertEquals("MANUAL",restored.limitSource());
    }

    @Test void changingModelCanActivateUsableKeysWhileSkippingIncompatibleBackup() {
        when(client.chat(anyString(),anyString(),anyString(),anyString())).thenReturn("OK");
        var first=editor.edit(new AiKeyEditorService.EditRequest("GROQ",null,"old-model",null,"Primary",
                "model-primary-AAAA",null,null,true));
        var pool=editor.edit(new AiKeyEditorService.EditRequest("GROQ",Long.valueOf(first.id()),"old-model",null,"Backup",
                "model-backup-BBBB",null,null,true));
        var next=providers.save(new com.smartphoneai.dto.request.AiSettingsRequest("GROQ","new-model",null,null,false,null,Long.valueOf(pool.id())));
        when(client.chat("GROQ","new-model","model-backup-BBBB","Reply with OK.")).thenThrow(new AiProviderException(404));
        assertDoesNotThrow(()->providers.test(new com.smartphoneai.dto.request.AiSettingsRequest("GROQ","new-model",null,null,false,null,Long.valueOf(next.id()))));
        providers.activate("GROQ",Long.valueOf(next.id()));
        assertEquals("MODEL_ERROR",quota.get("GROQ",null).keys().get(1).status());
        assertEquals("OK",providers.chat("question"));
        verify(client,never()).chat("GROQ","new-model","model-backup-BBBB","question");
    }

    @Test void reenteringAKnownSecretRestoresItsManualDailyLimit() {
        when(client.chat(anyString(), anyString(), anyString(), anyString())).thenReturn("OK");
        var first = editor.edit(new AiKeyEditorService.EditRequest("GROQ", null, "model", null, "Main",
                "daily-known-key", "known-project", null, true, 500L, false));
        var second = editor.edit(new AiKeyEditorService.EditRequest("GROQ", Long.valueOf(first.id()), "model", "PRIMARY", "Main",
                "daily-other-key", "other-project", null, true, null, true));
        editor.edit(new AiKeyEditorService.EditRequest("GROQ", Long.valueOf(second.id()), "model", "PRIMARY", "Main",
                "daily-known-key", null, null, true, null, true));
        var restored = quota.get("GROQ", null).keys().getFirst();
        assertEquals(500L, restored.dailyRequestLimit());
        assertEquals("MANUAL", restored.dailyLimitSource());
    }

    @Test void defaultSelectionRestoresObservedQuotaWithoutOverwritingManualChoiceEarly() {
        when(client.chat(anyString(),anyString(),anyString(),anyString())).thenReturn("OK");
        var created=editor.edit(new AiKeyEditorService.EditRequest("GROQ",null,"model",null,"Observed",
                "observed-private-AAAA","organization",500L,false));
        tracker.observeLimit("GROQ",AiQuotaTracker.fingerprint("observed-private-AAAA"),"model",1000L);
        assertEquals(500L,quota.get("GROQ",null).keys().getFirst().tpmLimit());
        editor.edit(new AiKeyEditorService.EditRequest("GROQ",Long.valueOf(created.id()),"model","PRIMARY","Observed",
                null,"organization",null,true));
        assertEquals(1000L,quota.get("GROQ",null).keys().getFirst().tpmLimit());
        assertEquals("PROVIDER",quota.get("GROQ",null).keys().getFirst().limitSource());
    }
}
