package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.dto.request.CreateConversationRequest;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.ChatUnauthorizedException;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AiChatService;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.support.JwtTestClient;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:customerchat;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class CustomerChatAccessDeletionIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired AuthTokenService tokens;
    @Autowired AiChatService chats;
    @Autowired JdbcTemplate jdbc;
    @MockitoBean TopicRouter router;
    @MockitoBean ChatResponder responder;

    @Test void anonymousAndLegacyGuestTokensCannotAccessAnyChatOperation() throws Exception {
        String token = "legacy-guest-token-" + UUID.randomUUID();
        UUID guest = UUID.randomUUID(), conversation = UUID.randomUUID(), topicSwitch = UUID.randomUUID();
        Instant now = Instant.now();
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        jdbc.update("insert into ai_guest_sessions(id,token_hash,created_at,expires_at) values(?,?,?,?)",
                guest, hash, Timestamp.from(now), Timestamp.from(now.plusSeconds(3600)));
        jdbc.update("insert into ai_conversations(id,guest_id,topic,title,created_at,product_ids) values(?,?,?,?,?,?)",
                conversation, guest, "PHONE_CONSULTATION", "Legacy", Timestamp.from(now), "[]");
        jdbc.update("insert into ai_topic_switch_requests(id,conversation_id,suggested_topic,question,status,expires_at) values(?,?,?,?,?,?)",
                topicSwitch, conversation, "SHOP_SUPPORT", "question", "PENDING", Timestamp.from(now.plusSeconds(600)));
        for (boolean legacyToken : List.of(false, true)) {
            for (var request : operations(conversation.toString(), topicSwitch.toString())) {
                if (legacyToken) request.header("X-Guest-Session", token);
                mvc.perform(request).andExpect(status().isUnauthorized());
            }
        }
        assertEquals(1, count("ai_conversations", conversation.toString()));
        assertEquals(0, jdbc.queryForObject("select count(*) from ai_messages where conversation_id = ?", Integer.class, conversation));
        verifyNoInteractions(router, responder);
    }

    @Test void adminCannotAccessAnyChatOperation() throws Exception {
        var client = JwtTestClient.authenticated(tokens, user(UserAccount.Role.ADMIN));
        for (var request : operations(UUID.randomUUID().toString(), UUID.randomUUID().toString())) {
            mvc.perform(request.with(client)).andExpect(status().isForbidden());
        }
        verifyNoInteractions(router, responder);
    }

    @Test void customerCannotMintGuestSessions() throws Exception {
        int before = jdbc.queryForObject("select count(*) from ai_guest_sessions", Integer.class);
        mvc.perform(post("/api/ai/guest-sessions").with(customer()).with(csrf())).andExpect(status().isNotFound());
        assertEquals(before, jdbc.queryForObject("select count(*) from ai_guest_sessions", Integer.class));
    }

    @Test void serviceRequiresAuthenticatedCustomerEvenWhenCalledOutsideController() {
        var request = new CreateConversationRequest("PHONE_CONSULTATION", List.of());
        var admin = user(UserAccount.Role.ADMIN);
        var adminAuth = UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(admin.getId()), null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        var unauthenticated = UsernamePasswordAuthenticationToken.unauthenticated(new AccountPrincipal(admin.getId()), null);
        assertThrows(ChatUnauthorizedException.class, () -> chats.create(null, "legacy-token", request));
        assertThrows(ChatUnauthorizedException.class, () -> chats.create(unauthenticated, null, request));
        assertThrows(AccessDeniedException.class, () -> chats.create(adminAuth, null, request));
    }

    @Test void deleteRemovesMessagesAndSwitchReferencesInBothDirectionsAndPreservesOtherChats() throws Exception {
        switchingAnswers();
        var customer = customer();
        String source = create(customer);
        String incomingSwitch = suggest(customer, source);
        String target = confirm(customer, incomingSwitch);
        // The switched chat can itself hold a pending switch to the other visible mode.
        when(router.route(anyString(), anyString(), anyList())).thenReturn(new TopicRouter.Decision("DIFFERENT_TOPIC", "PHONE_CONSULTATION"));
        String outgoingSwitch = suggest(customer, target);
        String other = create(customer());
        mvc.perform(delete("/api/ai/conversations/" + target).with(customer).with(csrf())).andExpect(status().isNoContent());
        assertEquals(0, count("ai_conversations", target));
        assertEquals(0, count("ai_topic_switch_requests", incomingSwitch));
        assertEquals(0, count("ai_topic_switch_requests", outgoingSwitch));
        assertEquals(0, messageCount(target));
        assertEquals(1, count("ai_conversations", source));
        assertEquals(1, count("ai_conversations", other));
        mvc.perform(get("/api/ai/conversations/" + target).with(customer)).andExpect(status().isNotFound());
        mvc.perform(get("/api/ai/conversations").with(customer)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mvc.perform(post("/api/ai/topic-switches/" + incomingSwitch + "/confirm").with(customer).with(csrf())).andExpect(status().isConflict());
        verify(responder, times(1)).answer(anyString(), anyString(), anyList(), anyList());
    }

    @Test void otherCustomerAndMissingConversationDeleteReturn404WithoutSideEffects() throws Exception {
        var owner = customer();
        String id = create(owner);
        mvc.perform(delete("/api/ai/conversations/" + id).with(customer()).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(delete("/api/ai/conversations/" + UUID.randomUUID()).with(owner).with(csrf())).andExpect(status().isNotFound());
        assertEquals(1, count("ai_conversations", id));
        mvc.perform(delete("/api/ai/conversations/" + id).with(owner).with(csrf())).andExpect(status().isNoContent());
        mvc.perform(delete("/api/ai/conversations/" + id).with(owner).with(csrf())).andExpect(status().isNotFound());
    }

    @Test void concurrentDuplicateDeleteHasOneWinner() throws Exception {
        var customer = customer();
        String id = create(customer);
        var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var call = (java.util.concurrent.Callable<Integer>) () -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(delete("/api/ai/conversations/" + id).with(customer).with(csrf())).andReturn().getResponse().getStatus();
            };
            var first = pool.submit(call);
            var second = pool.submit(call);
            start.countDown();
            assertEquals(List.of(204, 404), List.of(first.get(15, TimeUnit.SECONDS), second.get(15, TimeUnit.SECONDS)).stream().sorted().toList());
        }
        assertEquals(0, count("ai_conversations", id));
    }

    @Test void deletionFinishesWhileProviderIsStillWaitingAndLateAnswerCannotRestoreChat() throws Exception {
        when(router.route(anyString(), anyString(), anyList())).thenReturn(new TopicRouter.Decision("SAME_TOPIC", null));
        var entered = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        when(responder.answer(anyString(), anyString(), anyList(), anyList())).thenAnswer(invocation -> {
            entered.countDown();
            assertTrue(release.await(10, TimeUnit.SECONDS));
            return new ChatResponder.Answer("Answer", List.of());
        });
        var customer = customer();
        String id = create(customer);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var send = pool.submit(() -> mvc.perform(message(id).with(customer)).andReturn().getResponse().getStatus());
            assertTrue(entered.await(10, TimeUnit.SECONDS));
            var deletion = pool.submit(() -> mvc.perform(delete("/api/ai/conversations/" + id).with(customer).with(csrf())).andReturn().getResponse().getStatus());
            try {
                assertEquals(204, deletion.get(2, TimeUnit.SECONDS));
                assertFalse(send.isDone());
                assertEquals(0, count("ai_conversations", id));
            } finally { release.countDown(); }
            assertEquals(404, send.get(15, TimeUnit.SECONDS));
        } finally {
            release.countDown();
        }
        assertEquals(0, count("ai_conversations", id));
        assertEquals(0, messageCount(id));
        mvc.perform(message(id).with(customer)).andExpect(status().isNotFound());
    }

    @Test void abandonedProcessingLeaseDoesNotDelayDeletion() throws Exception {
        var customer = customer();
        String id = create(customer);
        jdbc.update("UPDATE ai_conversations SET processing_token=?,processing_until=? WHERE id=?",
                UUID.randomUUID(), Timestamp.from(Instant.now().plusSeconds(600)), UUID.fromString(id));
        try (var pool = Executors.newSingleThreadExecutor()) {
            var deletion = pool.submit(() -> mvc.perform(delete("/api/ai/conversations/" + id)
                    .with(customer).with(csrf())).andReturn().getResponse().getStatus());
            try {
                assertEquals(204, deletion.get(2, TimeUnit.SECONDS));
            } finally { deletion.cancel(true); }
        }
        assertEquals(0, count("ai_conversations", id));
    }

    @Test void deletingCompletedChatAlsoRemovesItsRequestReceipts() throws Exception {
        when(router.route(anyString(), anyString(), anyList())).thenReturn(new TopicRouter.Decision("SAME_TOPIC", null));
        when(responder.answer(anyString(), anyString(), anyList(), anyList()))
                .thenReturn(new ChatResponder.Answer("Answer", List.of()));
        var customer = customer();
        String id = create(customer);
        mvc.perform(post("/api/ai/conversations/" + id + "/messages").with(customer).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("content", "Question", "requestId", UUID.randomUUID()))))
                .andExpect(status().isOk());
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM ai_chat_receipts WHERE conversation_id=?",
                Integer.class, UUID.fromString(id)));
        mvc.perform(delete("/api/ai/conversations/" + id).with(customer).with(csrf()))
                .andExpect(status().isNoContent());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM ai_chat_receipts WHERE conversation_id=?",
                Integer.class, UUID.fromString(id)));
        assertEquals(0, messageCount(id));
    }

    @Test void deletionDuringTopicSwitchCannotCreateNewConversationAfterProviderReturns() throws Exception {
        switchingAnswers();
        var customer = customer();
        String id = create(customer);
        String switchId = suggest(customer, id);
        var entered = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        when(responder.answer(anyString(), anyString(), anyList(), anyList())).thenAnswer(invocation -> {
            entered.countDown();
            assertTrue(release.await(10, TimeUnit.SECONDS));
            return new ChatResponder.Answer("Answer", List.of());
        });
        try (var pool = Executors.newFixedThreadPool(2)) {
            var confirmation = pool.submit(() -> mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm")
                    .with(customer).with(csrf())).andReturn().getResponse().getStatus());
            try {
                assertTrue(entered.await(10, TimeUnit.SECONDS));
                var deletion = pool.submit(() -> mvc.perform(delete("/api/ai/conversations/" + id)
                        .with(customer).with(csrf())).andReturn().getResponse().getStatus());
                assertEquals(204, deletion.get(2, TimeUnit.SECONDS));
                assertFalse(confirmation.isDone());
            } finally { release.countDown(); }
            assertEquals(404, confirmation.get(15, TimeUnit.SECONDS));
        }
        assertEquals(0, count("ai_conversations", id));
        mvc.perform(get("/api/ai/conversations").with(customer)).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test void concurrentConfirmedRetryAndTargetDeletionCannotRestoreDeletedChat() throws Exception {
        switchingAnswers();
        var customer = customer();
        String source = create(customer);
        String switchId = suggest(customer, source);
        String target = confirm(customer, switchId);
        var start = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var retry = pool.submit(() -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").with(customer).with(csrf())).andReturn().getResponse().getStatus();
            });
            var deletion = pool.submit(() -> {
                assertTrue(start.await(10, TimeUnit.SECONDS));
                return mvc.perform(delete("/api/ai/conversations/" + target).with(customer).with(csrf())).andReturn().getResponse().getStatus();
            });
            start.countDown();
            assertTrue(List.of(200, 409).contains(retry.get(15, TimeUnit.SECONDS)));
            assertEquals(204, deletion.get(15, TimeUnit.SECONDS));
        }
        assertEquals(0, count("ai_conversations", target));
        mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").with(customer).with(csrf())).andExpect(status().isConflict());
        verify(responder, times(1)).answer(anyString(), anyString(), anyList(), anyList());
    }

    private List<MockHttpServletRequestBuilder> operations(String id, String switchId) {
        return List.of(post("/api/ai/guest-sessions").with(csrf()), get("/api/ai/conversations"),
                get("/api/ai/conversations/" + id), delete("/api/ai/conversations/" + id).with(csrf()),
                post("/api/ai/conversations").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"SHOP_SUPPORT\"}"),
                message(id), post("/api/ai/topic-switches/" + switchId + "/confirm").with(csrf()),
                post("/api/ai/topic-switches/" + switchId + "/cancel").with(csrf()));
    }
    private UserAccount user(UserAccount.Role role) {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Customer", "0900000000", "x");
        user.activate();
        user.changeRole(role);
        return users.saveAndFlush(user);
    }
    private JwtTestClient customer() { return JwtTestClient.authenticated(tokens, user(UserAccount.Role.CUSTOMER)); }
    private String create(JwtTestClient customer) throws Exception {
        var result = mvc.perform(post("/api/ai/conversations").with(customer).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("topic", "PHONE_CONSULTATION")))).andExpect(status().isCreated()).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString()).path("conversationId").asText();
    }
    private MockHttpServletRequestBuilder message(String id) {
        return post("/api/ai/conversations/" + id + "/messages").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Question\"}");
    }
    private String suggest(JwtTestClient customer, String id) throws Exception {
        var result = mvc.perform(message(id).with(customer)).andExpect(status().isOk()).andExpect(jsonPath("$.type").value("SWITCH_REQUIRED")).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString()).path("switchRequestId").asText();
    }
    private String confirm(JwtTestClient customer, String switchId) throws Exception {
        var result = mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").with(customer).with(csrf())).andExpect(status().isOk()).andReturn();
        return mapper.readTree(result.getResponse().getContentAsString()).path("newConversationId").asText();
    }
    private void switchingAnswers() {
        when(router.route(anyString(), anyString(), anyList())).thenReturn(new TopicRouter.Decision("DIFFERENT_TOPIC", "SHOP_SUPPORT"));
        when(responder.answer(anyString(), anyString(), anyList(), anyList())).thenReturn(new ChatResponder.Answer("Answer", List.of()));
    }
    private int count(String table, String id) {
        return jdbc.queryForObject("select count(*) from " + table + " where id = ?", Integer.class, UUID.fromString(id));
    }
    private int messageCount(String id) {
        return jdbc.queryForObject("select count(*) from ai_messages where conversation_id = ?", Integer.class, UUID.fromString(id));
    }
}
