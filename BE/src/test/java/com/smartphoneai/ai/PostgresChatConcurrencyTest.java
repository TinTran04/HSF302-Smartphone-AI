package com.smartphoneai.ai;

import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.dto.request.CreateConversationRequest;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.ChatBusyException;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AiChatService;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.service.TopicRouter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@EnabledIfEnvironmentVariable(named="CHAT_TEST_POSTGRES_URL",matches="jdbc:postgresql:.*")
class PostgresChatConcurrencyTest {
    @DynamicPropertySource static void database(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", () -> System.getenv("CHAT_TEST_POSTGRES_URL"));
        properties.add("spring.datasource.username", () -> System.getenv("CHAT_TEST_POSTGRES_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("CHAT_TEST_POSTGRES_PASSWORD"));
    }
    @Autowired AiChatService chat;
    @Autowired UserAccountRepository users;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired com.smartphoneai.service.impl.AiQuotaTracker quota;
    @MockitoBean TopicRouter router;
    @MockitoBean ChatResponder responder;
    @MockitoBean OtpSender mail;

    @Test void concurrentDuplicateIsRejectedAndRetryReplaysTheCommittedResult() throws Exception {
        var user=UserAccount.pendingCustomer(UUID.randomUUID()+"@example.test","Customer","0900000000","x");
        user.activate(); users.saveAndFlush(user);
        var auth=UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(user.getId()),null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        UUID id=chat.create(auth,null,new CreateConversationRequest("PHONE_CONSULTATION",List.of()));
        UUID requestId=UUID.randomUUID();
        var entered=new CountDownLatch(1); var release=new CountDownLatch(1);
        when(router.route(anyString(),anyString(),anyList())).thenAnswer(invocation -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            entered.countDown(); assertTrue(release.await(10,TimeUnit.SECONDS));
            return new TopicRouter.Decision("SAME_TOPIC",null);
        });
        when(responder.answer(anyString(),anyString(),anyList(),anyList())).thenReturn(new ChatResponder.Answer("OK",List.of()));
        try (var executor=Executors.newSingleThreadExecutor()) {
            var first=executor.submit(() -> chat.send(auth,null,id,"Question",requestId));
            try {
                assertTrue(entered.await(10,TimeUnit.SECONDS));
                assertThrows(ChatBusyException.class,() -> chat.send(auth,null,id,"Question",requestId));
            } finally { release.countDown(); }
            assertEquals("OK",first.get(10,TimeUnit.SECONDS).get("answer"));
        }
        assertEquals("OK",chat.send(auth,null,id,"Question",requestId).get("answer"));
        verify(router,times(1)).route(anyString(),anyString(),anyList());
        assertEquals(2,((List<?>)chat.detail(auth,null,id).get("messages")).size());
        chat.delete(auth,id);
        assertEquals(0,jdbc.queryForObject("SELECT count(*) FROM ai_chat_receipts WHERE conversation_id = ?",Integer.class,id));
    }

    @Test void expiredLeaseCannotOverwriteANewerCommittedAnswer() throws Exception {
        var user=UserAccount.pendingCustomer(UUID.randomUUID()+"@example.test","Customer","0900000000","x");
        user.activate(); users.saveAndFlush(user);
        var auth=UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(user.getId()),null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        UUID id=chat.create(auth,null,new CreateConversationRequest("PHONE_CONSULTATION",List.of()));
        var entered=new CountDownLatch(1); var release=new CountDownLatch(1);
        var calls=new java.util.concurrent.atomic.AtomicInteger();
        when(router.route(anyString(),anyString(),anyList())).thenAnswer(invocation -> {
            if (calls.incrementAndGet()==1) {
                entered.countDown(); assertTrue(release.await(10,TimeUnit.SECONDS));
            }
            return new TopicRouter.Decision("SAME_TOPIC",null);
        });
        when(responder.answer(anyString(),anyString(),anyList(),anyList())).thenReturn(new ChatResponder.Answer("OK",List.of()));
        try (var executor=Executors.newSingleThreadExecutor()) {
            var first=executor.submit(() -> chat.send(auth,null,id,"Old question",UUID.randomUUID()));
            try {
                assertTrue(entered.await(10,TimeUnit.SECONDS));
                assertEquals(1,jdbc.update("UPDATE ai_conversations SET processing_until = CURRENT_TIMESTAMP - INTERVAL '1 second' WHERE id = ?",id));
                assertEquals("OK",chat.send(auth,null,id,"New question",UUID.randomUUID()).get("answer"));
            } finally { release.countDown(); }
            var error=assertThrows(java.util.concurrent.ExecutionException.class,() -> first.get(10,TimeUnit.SECONDS));
            assertInstanceOf(ChatBusyException.class,error.getCause());
        }
        var messages=(List<?>)chat.detail(auth,null,id).get("messages");
        assertEquals(2,messages.size());
        assertTrue(messages.toString().contains("New question"));
        assertFalse(messages.toString().contains("Old question"));
    }

    @Test void quotaReservationsAreSerializedOnPostgresAcrossConcurrentRequests() throws Exception {
        UUID a=UUID.randomUUID(), b=UUID.randomUUID();
        String model="model-"+UUID.randomUUID();
        jdbc.update("INSERT INTO ai_quota_projects(id,project_name) VALUES(?,?)",a,"a-"+a);
        jdbc.update("INSERT INTO ai_quota_projects(id,project_name) VALUES(?,?)",b,"b-"+b);
        jdbc.update("INSERT INTO ai_quota_project_limits(project_id,model,tpm_limit) VALUES(?,?,?)",a,model,100);
        jdbc.update("INSERT INTO ai_quota_project_limits(project_id,model,tpm_limit) VALUES(?,?,?)",b,model,100);
        String keyA=com.smartphoneai.service.impl.AiQuotaTracker.fingerprint("a-"+a);
        String keyB=com.smartphoneai.service.impl.AiQuotaTracker.fingerprint("b-"+b);
        jdbc.update("INSERT INTO ai_quota_keys(key_fingerprint,project_id) VALUES(?,?)",keyA,a);
        jdbc.update("INSERT INTO ai_quota_keys(key_fingerprint,project_id) VALUES(?,?)",keyB,b);
        var keys=List.of(new com.smartphoneai.service.impl.AiQuotaTracker.Key("primary",keyA),
                new com.smartphoneai.service.impl.AiQuotaTracker.Key("backup",keyB));
        var start=new CountDownLatch(1);
        try (var executor=Executors.newFixedThreadPool(10)) {
            var results=new java.util.ArrayList<java.util.concurrent.Future<String>>();
            for (int i=0;i<10;i++) results.add(executor.submit(()->{
                assertTrue(start.await(10,TimeUnit.SECONDS));
                return quota.reserve(keys,model,"1234567890",java.util.Set.of()).reference();
            }));
            start.countDown();
            int primary=0;
            for (var result:results) if ("primary".equals(result.get(20,TimeUnit.SECONDS))) primary++;
            assertEquals(8,primary);
        }
    }
}
