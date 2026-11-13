package com.smartphoneai.ai;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.exception.*;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.*;
import com.smartphoneai.service.impl.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:primarydeletion;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa","spring.datasource.password=",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
class AiPrimaryKeyDeletionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired AiKeyEditorService editor;
    @Autowired AiKeyManagementService keys;
    @Autowired AiQuotaSettingsService quota;
    @Autowired AiProviderService providers;
    @Autowired AiProviderConfigRepository configs;
    @Autowired AiBackupKeyRepository backups;
    @MockitoBean ChatProviderClient client;
    @MockitoBean OtpSender otp;

    @BeforeEach void resetConfigurations() {
        backups.deleteAll();
        configs.deleteAll();
        when(client.chat(anyString(),anyString(),anyString(),anyString())).thenReturn("OK");
    }

    @org.junit.jupiter.api.Test void deletingBackupFromUntestedDraftRevokesTheHistoricalActivePool() {
        var first = add("GEMINI", null, "Main", "draft-main-secret");
        var pool = add("GEMINI", Long.valueOf(first.id()), "Backup", "draft-backup-secret");
        providers.activate("GEMINI", Long.valueOf(pool.id()));
        var draft = providers.save(new AiSettingsRequest("GEMINI", "changed-model", null, null, false, null, Long.valueOf(pool.id())));
        var backup = keys.get("GEMINI").keys().get(1);
        var removed = editor.remove(Long.valueOf(draft.id()), backup.keyRef(), null);
        assertTrue(removed.backupKeys().isEmpty());
        assertFalse(removed.active());
        assertTrue(configs.findAllByActiveTrue().isEmpty());
    }

    @ParameterizedTest @ValueSource(strings={"GEMINI","GROQ","DEEPSEEK"})
    void deletingFinalKeyCreatesEmptyLatestVersionAndCanAddNewPrimary(String provider) {
        var initial=add(provider,null,"Initial","private-initial-AAAA");
        long oldId=Long.parseLong(initial.id());
        providers.activate(provider,oldId);
        var empty=assertDoesNotThrow(()->editor.removeOrMove(oldId,"PRIMARY",null));
        long emptyId=Long.parseLong(empty.id());
        assertNotEquals(oldId,emptyId);
        assertEquals("",empty.maskedKey());
        assertFalse(empty.active());
        assertFalse(empty.tested());
        assertEquals(empty.id(),keys.get(provider).configId());
        assertTrue(keys.get(provider).keys().isEmpty());
        assertTrue(quota.get(provider,null).keys().isEmpty());
        assertTrue(configs.findAllByActiveTrue().isEmpty());
        assertThrows(InvalidAiConfigurationException.class,()->providers.activate(provider,oldId));
        assertThrows(InvalidAiConfigurationException.class,()->providers.activate(provider,emptyId));
        assertThrows(InvalidAiConfigurationException.class,()->editor.checkKey(emptyId,"PRIMARY"));
        assertThrows(InvalidAiConfigurationException.class,()->providers.test(new AiSettingsRequest(provider,"model",null,null,false,null,emptyId)));
        assertThrows(InvalidAiConfigurationException.class,()->editor.removeOrMove(oldId,"PRIMARY",null));
        assertThrows(InvalidAiConfigurationException.class,()->add(provider,oldId,"Stale","stale-secret-CCCC"));
        var fresh=add(provider,emptyId,"Fresh","private-fresh-BBBB");
        assertEquals(1,keys.get(provider).keys().size());
        assertEquals("PRIMARY",keys.get(provider).keys().getFirst().keyRef());
        assertEquals("Fresh",keys.get(provider).keys().getFirst().name());
        assertTrue(fresh.tested());
        assertFalse(fresh.active());
        providers.activate(provider,Long.parseLong(fresh.id()));
        assertEquals("OK",providers.chat("question"));
    }

    @ParameterizedTest @ValueSource(strings={"GEMINI","GROQ","DEEPSEEK"}) @WithMockUser(roles="ADMIN")
    void selectedBackupReplacesDeletedPrimaryAndKeepsOtherKeys(String provider) throws Exception {
        var primary=add(provider,null,"Original","deletion-primary-AAAA");
        var one=add(provider,Long.parseLong(primary.id()),"First","deletion-backup-BBBB");
        var two=add(provider,Long.parseLong(one.id()),"Selected","deletion-backup-CCCC");
        var pool=add(provider,Long.parseLong(two.id()),"Last","deletion-backup-DDDD");
        long configId=Long.parseLong(pool.id());
        providers.activate(provider,configId);
        var before=keys.get(provider).keys();
        String selected=before.get(2).keyRef();
        quota.configureKey(configs.findById(configId).orElseThrow(),selected,"selected-project",12345L,false);
        var remaining=backups.findAllByConfigIdOrderByPriorityAsc(configId).getFirst();
        remaining.recordOutcome("AI_PROVIDER_AUTH_ERROR",java.time.Instant.parse("2026-01-01T00:00:00Z"));
        backups.saveAndFlush(remaining);
        mvc.perform(delete("/api/admin/ai-settings/key-management/{id}/key/PRIMARY",configId).with(csrf()))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/admin/ai-settings/key-management/{id}/key/PRIMARY",configId).with(csrf())
                .param("replacementKeyRef","PRIMARY")).andExpect(status().isConflict());
        mvc.perform(delete("/api/admin/ai-settings/key-management/{id}/key/PRIMARY",configId).with(csrf())
                .param("replacementKeyRef","9223372036854775807")).andExpect(status().isConflict());
        mvc.perform(delete("/api/admin/ai-settings/key-management/{id}/key/PRIMARY",configId).with(csrf())
                .param("replacementKeyRef",selected)).andExpect(status().isOk())
                .andExpect(jsonPath("active").value(true))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("deletion-primary-AAAA"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("deletion-backup-CCCC"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("v1:"))));
        var after=keys.get(provider);
        assertNotEquals(pool.id(),after.configId());
        assertEquals(java.util.List.of("Selected","First","Last"),after.keys().stream().map(AiKeyManagementService.KeyView::name).toList());
        assertEquals(before.get(2).identity(),after.keys().getFirst().identity());
        assertEquals("PRIMARY",after.keys().getFirst().keyRef());
        assertFalse(after.keys().stream().anyMatch(key->key.identity().equals(before.getFirst().identity())));
        assertEquals("selected-project",quota.get(provider,null).keys().getFirst().projectName());
        assertEquals(12345L,quota.get(provider,null).keys().getFirst().tpmLimit());
        var retained=backups.findAllByConfigIdOrderByPriorityAsc(Long.parseLong(after.configId())).getFirst();
        assertEquals("AI_PROVIDER_AUTH_ERROR",retained.getLastFailureReason());
        assertEquals("OK",providers.chat("question"));
        verify(client).chat(provider,"model","deletion-backup-CCCC","question");
        assertThrows(InvalidAiConfigurationException.class,()->editor.removeOrMove(configId,"PRIMARY",null));
    }

    @ParameterizedTest @ValueSource(strings={"GEMINI","GROQ","DEEPSEEK"})
    void clearingInactiveProviderPreservesAnotherActiveProvider(String provider) {
        String other="GROQ".equals(provider)?"DEEPSEEK":"GROQ";
        var inactive=add(provider,null,"To remove","inactive-private-AAAA");
        var active=add(other,null,"Active","active-private-BBBB");
        providers.activate(other,Long.parseLong(active.id()));
        assertDoesNotThrow(()->editor.removeOrMove(Long.parseLong(inactive.id()),"PRIMARY",null));
        assertEquals(Long.parseLong(active.id()),configs.findAllByActiveTrue().getFirst().getId());
        assertEquals(1,configs.findAllByActiveTrue().size());
    }

    @org.junit.jupiter.api.Test
    void concurrentDeletionsRejectTheStaleVersion() throws Exception {
        var initial=add("GROQ",null,"Concurrent","concurrent-private-AAAA");
        long configId=Long.parseLong(initial.id());
        var start=new java.util.concurrent.CountDownLatch(1);
        try (var workers=java.util.concurrent.Executors.newFixedThreadPool(2)) {
            java.util.concurrent.Callable<Boolean> remove=()-> {
                start.await();
                try {
                    editor.removeOrMove(configId,"PRIMARY",null);
                    return true;
                } catch (InvalidAiConfigurationException stale) {
                    return false;
                }
            };
            var first=workers.submit(remove);
            var second=workers.submit(remove);
            start.countDown();
            assertNotEquals(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS));
        }
        assertTrue(keys.get("GROQ").keys().isEmpty());
        assertEquals(2,configs.count());
    }

    @org.junit.jupiter.api.Test
    void deletingPrimaryFromUntestedLatestVersionDisablesHistoricalActiveKeys() {
        var first=add("GROQ",null,"Historical primary","historical-private-AAAA");
        var pool=add("GROQ",Long.parseLong(first.id()),"Historical backup","historical-backup-BBBB");
        providers.activate("GROQ",Long.parseLong(pool.id()));
        var untested=providers.save(new AiSettingsRequest("GROQ","changed-model",null,null,false,null,Long.parseLong(pool.id())));
        String selected=keys.get("GROQ").keys().get(1).keyRef();
        var result=editor.remove(Long.parseLong(untested.id()),"PRIMARY",selected);
        assertFalse(result.tested());
        assertFalse(result.active());
        assertTrue(configs.findAllByActiveTrue().isEmpty());
        assertThrows(InvalidAiConfigurationException.class,()->providers.activate("GROQ",Long.parseLong(pool.id())));
    }

    private com.smartphoneai.dto.response.AiSettingsResponse add(String provider,Long configId,String name,String secret) {
        return editor.edit(new AiKeyEditorService.EditRequest(provider,configId,"model",null,name,secret,null,null,true));
    }
}
