package com.smartphoneai.knowledge;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.KnowledgeChunk;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.repository.KnowledgeChunkRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.service.*;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RagServiceTest {
    @Test void newerEvidenceIsPresentedFirstAndOnlyRetrievedIdsMayBeCited() {
        var docs=mock(KnowledgeDocumentRepository.class);
        var chunks=mock(KnowledgeChunkRepository.class);
        var vectors=mock(KnowledgeVectorStore.class);
        var ai=mock(AiProviderService.class);
        var oldDoc=new KnowledgeDocument("old.txt",10,"[]",Instant.parse("2026-01-01T00:00:00Z")); oldDoc.ready("v1");
        var newDoc=new KnowledgeDocument("new.txt",10,"[]",Instant.parse("2026-02-01T00:00:00Z")); newDoc.ready("v1");
        var oldChunk=new KnowledgeChunk(oldDoc.getId(),null,"Chính sách cũ", "v1");
        var newChunk=new KnowledgeChunk(newDoc.getId(),null,"Chính sách mới", "v1");
        when(docs.findAllByStatus("READY")).thenReturn(List.of(oldDoc,newDoc));
        when(vectors.currentVersion()).thenReturn("v1");
        when(vectors.search(anyString(),anySet(),eq("v1"))).thenReturn(List.of(
                new KnowledgeVectorStore.Hit(oldChunk.getId(),0.99),new KnowledgeVectorStore.Hit(newChunk.getId(),0.80)));
        when(chunks.findById(oldChunk.getId())).thenReturn(Optional.of(oldChunk));
        when(chunks.findById(newChunk.getId())).thenReturn(Optional.of(newChunk));
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Theo chính sách mới.\",\"citedChunkIds\":[\""+newChunk.getId()+"\"]}")
                .thenReturn("{\"answer\":\"Bịa nguồn\",\"citedChunkIds\":[\"unknown\"]}");
        var service=new RagService(docs,chunks,vectors,ai,new ObjectMapper());
        var result=service.answer("Chính sách?");
        assertEquals(newDoc.getId().toString(),result.sources().getFirst().documentId());
        var prompt=ArgumentCaptor.forClass(String.class); verify(ai).chat(prompt.capture());
        assertTrue(prompt.getValue().indexOf("new.txt")<prompt.getValue().indexOf("old.txt"));
        assertTrue(service.answer("Chính sách?").sources().isEmpty());
    }
}
