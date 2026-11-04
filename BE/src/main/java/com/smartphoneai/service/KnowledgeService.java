package com.smartphoneai.service;

import com.smartphoneai.dto.response.KnowledgeDocumentResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface KnowledgeService {
    UUID create(MultipartFile file);

    void replace(UUID id, MultipartFile file);

    KnowledgeDocumentResponse get(UUID id);

    List<KnowledgeDocumentResponse> list();

    KnowledgeDocumentResponse enabled(UUID id, boolean enabled);

    void delete(UUID id);

    void markFailed(UUID id, UUID attempt);

    UUID processingAttempt(UUID id);

    KnowledgeDocumentResponse markProcessing(UUID id);
}
