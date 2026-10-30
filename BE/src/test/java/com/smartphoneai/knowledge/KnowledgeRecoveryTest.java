package com.smartphoneai.knowledge;

import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.service.DocumentProcessingService;
import com.smartphoneai.service.KnowledgeRecovery;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

class KnowledgeRecoveryTest {
    @Test void retriesDocumentsLeftProcessingAfterRestart() {
        var documents = mock(KnowledgeDocumentRepository.class);
        var processing = mock(DocumentProcessingService.class);
        var doc = new KnowledgeDocument("pending.txt", 1, "[]", Instant.now());
        when(documents.findAllByStatus("PROCESSING")).thenReturn(List.of(doc));
        new KnowledgeRecovery(documents, processing).recover();
        verify(processing).process(doc.getId());
    }
}
