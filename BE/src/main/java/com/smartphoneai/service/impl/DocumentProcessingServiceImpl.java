package com.smartphoneai.service.impl;

import com.smartphoneai.service.DocumentProcessingService;
import com.smartphoneai.service.KnowledgeIndexWorker;
import com.smartphoneai.service.KnowledgeService;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import java.util.UUID;
@Service
public class DocumentProcessingServiceImpl implements DocumentProcessingService {
    private final KnowledgeIndexWorker worker;
    private final KnowledgeService documents;
    public DocumentProcessingServiceImpl(KnowledgeIndexWorker worker, KnowledgeService documents) { this.worker=worker; this.documents=documents; }
    @Override
    @Async
    public void process(UUID id) {
        UUID attempt;
        try { attempt = documents.processingAttempt(id); }
        catch (com.smartphoneai.exception.KnowledgeNotFoundException ex) { return; }
        try { worker.index(id, attempt); }
        catch (com.smartphoneai.exception.KnowledgeNotFoundException ex) { /* Document was deleted while queued. */ }
        catch (RuntimeException ex) {
            try { documents.markFailed(id, attempt); }
            catch (com.smartphoneai.exception.KnowledgeNotFoundException ignored) { /* Deleted after processing failed. */ }
        }
    }
}
