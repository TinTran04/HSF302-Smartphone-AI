package com.smartphoneai.service;

import com.smartphoneai.repository.KnowledgeDocumentRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class KnowledgeRecovery {
    private final KnowledgeDocumentRepository documents;
    private final DocumentProcessingService processing;

    public KnowledgeRecovery(KnowledgeDocumentRepository documents, DocumentProcessingService processing) {
        this.documents = documents;
        this.processing = processing;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void recover() {
        documents.findAllByStatus("PROCESSING").forEach(document -> processing.process(document.getId()));
    }
}
