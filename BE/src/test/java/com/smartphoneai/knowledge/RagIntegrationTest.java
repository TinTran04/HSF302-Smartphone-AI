package com.smartphoneai.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.TimeUnit;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:ragtest;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=ragadmin@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class RagIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired AuthTokenService tokens;
    @Autowired KnowledgeDocumentRepository documents;
    @Autowired com.smartphoneai.repository.AiMessageRepository messages;
    @MockitoBean OtpSender sender;
    @MockitoBean KnowledgeVectorStore vectors;
    @MockitoBean TopicRouter router;
    @MockitoBean AiProviderService ai;
    @Test void ragCitesRetrievedReadyDocumentAndIgnoresDisabledDocument() throws Exception {
        when(vectors.currentVersion()).thenReturn("embedding-v1");
        var chunkId=new AtomicReference<java.util.UUID>();
        doAnswer(inv -> { java.util.List<KnowledgeVectorStore.VectorChunk> chunks=inv.getArgument(2); chunkId.set(chunks.getFirst().id()); return null; })
                .when(vectors).replace(any(),anyString(),anyList(),anyString());
        var admin=new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"ragadmin@example.com\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        var file=new MockMultipartFile("file","policy.txt","text/plain","Chính sách demo: bảo hành 12 tháng.".getBytes(StandardCharsets.UTF_8));
        var uploaded=mvc.perform(multipart("/api/admin/knowledge/documents").file(file).with(admin).with(csrf()))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value("PROCESSING")).andReturn();
        String docId=mapper.readTree(uploaded.getResponse().getContentAsString()).path("id").asText();
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("READY", documents.findById(java.util.UUID.fromString(docId)).orElseThrow().getStatus()));
        when(vectors.search(anyString(),anySet(),eq("embedding-v1"))).thenAnswer(invocation -> {
            org.junit.jupiter.api.Assertions.assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return List.of(new KnowledgeVectorStore.Hit(chunkId.get(),0.9));
        });
        when(ai.chat(anyString())).thenAnswer(invocation -> {
            org.junit.jupiter.api.Assertions.assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return "```json\n{\"answer\":\"Bảo hành 12 tháng.\",\"citedChunkIds\":[\""+chunkId.get()+"\"]}\n```";
        });
        when(router.route(anyString(),anyString(),anyList())).thenReturn(new TopicRouter.Decision("SAME_TOPIC",null));
        var user = UserAccount.pendingCustomer(java.util.UUID.randomUUID() + "@example.com", "Customer", "0900000000", "x");
        user.activate();
        var customer = JwtTestClient.authenticated(tokens, users.saveAndFlush(user));
        var conversation=mvc.perform(post("/api/ai/conversations").with(customer).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"topic\":\"SHOP_SUPPORT\"}")).andExpect(status().isCreated()).andReturn();
        String id=mapper.readTree(conversation.getResponse().getContentAsString()).path("conversationId").asText();
        mvc.perform(post("/api/ai/conversations/"+id+"/messages").with(customer).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Bảo hành bao lâu?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.answer").value("Bảo hành 12 tháng."))
                .andExpect(jsonPath("$.sources").isEmpty())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("policy.txt"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString(docId))));
        assertTrue(messages.findAllByConversationIdOrderByIdAsc(java.util.UUID.fromString(id))
                .getLast().getSourcesJson().contains(docId));
        mvc.perform(get("/api/ai/conversations/" + id).with(customer))
                .andExpect(status().isOk()).andExpect(jsonPath("$.messages[1].sources").isEmpty())
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("policy.txt"))))
                .andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString(docId))));
        mvc.perform(patch("/api/admin/knowledge/documents/"+docId+"/status").with(admin).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":false}")).andExpect(status().isOk());
        mvc.perform(post("/api/ai/conversations/"+id+"/messages").with(customer).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Còn bảo hành không?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sources.length()").value(0));
        verify(ai,times(1)).chat(anyString());
    }
}
