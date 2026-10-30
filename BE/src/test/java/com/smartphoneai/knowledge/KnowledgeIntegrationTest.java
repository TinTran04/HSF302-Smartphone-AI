package com.smartphoneai.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.KnowledgeVectorStore;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.service.KnowledgeService;
import static org.junit.jupiter.api.Assertions.*;
import static org.awaitility.Awaitility.await;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:knowledge;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=knowledgeadmin", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class KnowledgeIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired KnowledgeDocumentRepository documents;
    @Autowired KnowledgeService knowledge;
    @MockitoBean OtpSender sender;
    @MockitoBean KnowledgeVectorStore vectors;
    @Test void lateFailureCannotUndoCompletedIndexing() {
        var document = new com.smartphoneai.entity.KnowledgeDocument("completed.txt", 1, "[]", java.time.Instant.now());
        document.ready("embedding-v1");
        documents.saveAndFlush(document);
        knowledge.markFailed(document.getId(), document.getProcessingAttempt());
        assertEquals("READY", documents.findById(document.getId()).orElseThrow().getStatus());
    }
    @Test void failureFromOlderAttemptCannotFailNewerPendingAttempt() {
        var document = new com.smartphoneai.entity.KnowledgeDocument("new-attempt.txt", 1, "[]", java.time.Instant.now());
        documents.saveAndFlush(document);
        var previousAttempt = document.getProcessingAttempt();
        knowledge.markProcessing(document.getId());
        knowledge.markFailed(document.getId(), previousAttempt);
        assertEquals("PROCESSING", documents.findById(document.getId()).orElseThrow().getStatus());
    }
    @Test void failedEmbeddingMarksDocumentFailed() throws Exception {
        when(vectors.currentVersion()).thenThrow(new IllegalStateException("Embedding unavailable"));
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"knowledgeadmin\",\"password\":\"TestRootPassword123!\"}"))
                .andExpect(status().isOk());
        var file = new MockMultipartFile("file", "failure.txt", "text/plain", "Demo document".getBytes(StandardCharsets.UTF_8));
        var uploaded = mvc.perform(multipart("/api/admin/knowledge/documents").file(file).session(session).with(csrf()))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value("PROCESSING")).andReturn();
        var id = java.util.UUID.fromString(mapper.readTree(uploaded.getResponse().getContentAsString()).path("id").asText());
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("FAILED", documents.findById(id).orElseThrow().getStatus()));
    }
    @Test void uploadReturnsProcessingWithoutWaitingForEmbedding() throws Exception {
        var entered = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        when(vectors.currentVersion()).thenAnswer(inv -> {
            entered.countDown();
            if (!release.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("Embedding was not released");
            return "embedding-v1";
        });
        var session=new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"knowledgeadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        var file=new MockMultipartFile("file","async.txt","text/plain","Demo document".getBytes(StandardCharsets.UTF_8));
        String id;
        try {
            var future = CompletableFuture.supplyAsync(() -> {
                try { return mvc.perform(multipart("/api/admin/knowledge/documents").file(file).session(session).with(csrf())).andReturn(); }
                catch (Exception ex) { throw new RuntimeException(ex); }
            });
            var response = future.get(3, TimeUnit.SECONDS).getResponse();
            assertEquals(202, response.getStatus());
            var body = mapper.readTree(response.getContentAsString());
            assertEquals("PROCESSING", body.path("status").asText());
            id = body.path("id").asText();
            assertTrue(entered.await(3, TimeUnit.SECONDS));
        } finally { release.countDown(); }
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("READY", documents.findById(java.util.UUID.fromString(id)).orElseThrow().getStatus()));
    }
    @Test void adminUploadsIndexesDisablesAndDeletesDocument() throws Exception {
        when(vectors.currentVersion()).thenReturn("embedding-v1");
        var session=new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"knowledgeadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        var file=new MockMultipartFile("file","demo.txt","text/plain","Chính sách demo: bảo hành 12 tháng.".getBytes(StandardCharsets.UTF_8));
        var upload=mvc.perform(multipart("/api/admin/knowledge/documents").file(file).session(session).with(csrf()))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value("PROCESSING")).andReturn();
        String id=mapper.readTree(upload.getResponse().getContentAsString()).path("id").asText();
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("READY", documents.findById(java.util.UUID.fromString(id)).orElseThrow().getStatus()));
        mvc.perform(patch("/api/admin/knowledge/documents/"+id+"/status").session(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DISABLED"));
        mvc.perform(post("/api/admin/knowledge/documents/"+id+"/reindex").session(session).with(csrf()))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value("PROCESSING"));
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("DISABLED", documents.findById(java.util.UUID.fromString(id)).orElseThrow().getStatus()));
        mvc.perform(patch("/api/admin/knowledge/documents/"+id+"/status").session(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":true}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("READY"));
        mvc.perform(delete("/api/admin/knowledge/documents/"+id).session(session).with(csrf())).andExpect(status().isNoContent());
        verify(vectors,atLeastOnce()).delete(java.util.UUID.fromString(id));
        var invalid=new MockMultipartFile("file","bad.exe","application/octet-stream",new byte[]{1,2});
        mvc.perform(multipart("/api/admin/knowledge/documents").file(invalid).session(session).with(csrf())).andExpect(status().isBadRequest());
    }
}
