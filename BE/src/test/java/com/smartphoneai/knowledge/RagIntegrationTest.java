package com.smartphoneai.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.*;
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
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.TimeUnit;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:ragtest;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=ragadmin", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class RagIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired KnowledgeDocumentRepository documents;
    @MockitoBean OtpSender sender;
    @MockitoBean KnowledgeVectorStore vectors;
    @MockitoBean TopicRouter router;
    @MockitoBean AiProviderService ai;
    @Test void ragCitesRetrievedReadyDocumentAndIgnoresDisabledDocument() throws Exception {
        when(vectors.currentVersion()).thenReturn("embedding-v1");
        var chunkId=new AtomicReference<java.util.UUID>();
        doAnswer(inv -> { java.util.List<KnowledgeVectorStore.VectorChunk> chunks=inv.getArgument(2); chunkId.set(chunks.getFirst().id()); return null; })
                .when(vectors).replace(any(),anyString(),anyList(),anyString());
        var admin=new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"ragadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        var file=new MockMultipartFile("file","policy.txt","text/plain","Chính sách demo: bảo hành 12 tháng.".getBytes(StandardCharsets.UTF_8));
        var uploaded=mvc.perform(multipart("/api/admin/knowledge/documents").file(file).session(admin).with(csrf()))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.status").value("PROCESSING")).andReturn();
        String docId=mapper.readTree(uploaded.getResponse().getContentAsString()).path("id").asText();
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() ->
                assertEquals("READY", documents.findById(java.util.UUID.fromString(docId)).orElseThrow().getStatus()));
        when(vectors.search(anyString(),anySet(),eq("embedding-v1"))).thenReturn(List.of(new KnowledgeVectorStore.Hit(chunkId.get(),0.9)));
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Bảo hành 12 tháng.\",\"citedChunkIds\":[\""+chunkId.get()+"\"]}");
        when(router.route(anyString(),anyString(),anyList())).thenReturn(new TopicRouter.Decision("SAME_TOPIC",null));
        var guest=mvc.perform(post("/api/ai/guest-sessions").with(csrf())).andExpect(status().isCreated()).andReturn();
        String token=mapper.readTree(guest.getResponse().getContentAsString()).path("guestSessionToken").asText();
        var conversation=mvc.perform(post("/api/ai/conversations").header("X-Guest-Session",token).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"topic\":\"SHOP_SUPPORT\"}")).andExpect(status().isCreated()).andReturn();
        String id=mapper.readTree(conversation.getResponse().getContentAsString()).path("conversationId").asText();
        mvc.perform(post("/api/ai/conversations/"+id+"/messages").header("X-Guest-Session",token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Bảo hành bao lâu?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sources[0].documentId").value(docId));
        mvc.perform(patch("/api/admin/knowledge/documents/"+docId+"/status").session(admin).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"enabled\":false}")).andExpect(status().isOk());
        mvc.perform(post("/api/ai/conversations/"+id+"/messages").header("X-Guest-Session",token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Còn bảo hành không?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.sources.length()").value(0));
        verify(ai,times(1)).chat(anyString());
    }
}
