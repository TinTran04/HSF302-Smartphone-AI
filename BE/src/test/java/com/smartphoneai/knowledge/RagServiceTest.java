package com.smartphoneai.knowledge;

import com.smartphoneai.service.impl.ChatResponderImpl;
import com.smartphoneai.service.impl.RagServiceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.KnowledgeChunk;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.exception.InvalidAiConfigurationException;
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
    @Test void providerConfigurationFailureIsPropagatedWhenRetrievedEvidenceExists() {
        var docs=mock(KnowledgeDocumentRepository.class);
        var chunks=mock(KnowledgeChunkRepository.class);
        var vectors=mock(KnowledgeVectorStore.class);
        var ai=mock(AiProviderService.class);
        var doc=new KnowledgeDocument("policy.txt",10,"[]",Instant.now());
        doc.ready("v1");
        var chunk=new KnowledgeChunk(doc.getId(),null,"Bảo hành 12 tháng","v1");
        when(docs.findAllByStatus("READY")).thenReturn(List.of(doc));
        when(vectors.currentVersion()).thenReturn("v1");
        when(vectors.search(anyString(),anySet(),eq("v1")))
                .thenReturn(List.of(new KnowledgeVectorStore.Hit(chunk.getId(),0.9)));
        when(chunks.findById(chunk.getId())).thenReturn(Optional.of(chunk));
        var failure=new InvalidAiConfigurationException();
        when(ai.chat(anyString())).thenThrow(failure);
        var service=new RagServiceImpl(docs,chunks,vectors,ai,new ObjectMapper());

        assertSame(failure,assertThrows(InvalidAiConfigurationException.class,
                () -> service.answer("Chính sách bảo hành?")));
    }

    @Test void shopSupportIncludesPreviousQuestionForFollowUpRetrieval() {
        var docs=mock(KnowledgeDocumentRepository.class); var chunks=mock(KnowledgeChunkRepository.class);
        var vectors=mock(KnowledgeVectorStore.class); var ai=mock(AiProviderService.class);
        var doc=new KnowledgeDocument("policy.txt",10,"[]",Instant.now()); doc.ready("v1");
        var chunk=new KnowledgeChunk(doc.getId(),null,"Bảo hành 12 tháng", "v1");
        when(docs.findAllByStatus("READY")).thenReturn(List.of(doc)); when(vectors.currentVersion()).thenReturn("v1");
        when(vectors.search(anyString(),anySet(),eq("v1"))).thenReturn(List.of(new KnowledgeVectorStore.Hit(chunk.getId(),0.9)));
        when(chunks.findById(chunk.getId())).thenReturn(Optional.of(chunk));
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"12 tháng\",\"citedChunkIds\":[\""+chunk.getId()+"\"]}");
        var rag=new RagServiceImpl(docs,chunks,vectors,ai,new ObjectMapper());
        var responder=new ChatResponderImpl(mock(PhoneAssistanceService.class),rag);
        var history=List.of(new com.smartphoneai.dto.response.ChatMessageResponse("1","user","Chính sách bảo hành?",List.of(),List.of(),List.of()));
        responder.answer("SHOP_SUPPORT","Áp dụng bao lâu?",history,List.of());
        verify(vectors).search(argThat(q -> q.contains("Chính sách bảo hành") && q.contains("Áp dụng bao lâu")),anySet(),eq("v1"));
    }
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
        var service=new RagServiceImpl(docs,chunks,vectors,ai,new ObjectMapper());
        var result=service.answer("Chính sách?");
        assertEquals(newDoc.getId().toString(),result.sources().getFirst().documentId());
        var prompt=ArgumentCaptor.forClass(String.class); verify(ai).chat(prompt.capture());
        assertTrue(prompt.getValue().indexOf("new.txt")<prompt.getValue().indexOf("old.txt"));
        assertTrue(service.answer("Chính sách?").sources().isEmpty());
    }
}
