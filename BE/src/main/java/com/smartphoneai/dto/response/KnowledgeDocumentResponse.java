package com.smartphoneai.dto.response;
import com.smartphoneai.entity.KnowledgeDocument;
import java.time.Instant;
public record KnowledgeDocumentResponse(String id, String name, long size, Instant uploadedAt,
        Instant contentUpdatedAt, String status, String error) {
    public static KnowledgeDocumentResponse from(KnowledgeDocument doc) {
        return new KnowledgeDocumentResponse(doc.getId().toString(),doc.getName(),doc.getSize(),doc.getUploadedAt(),
                doc.getContentUpdatedAt(),doc.getStatus(),doc.getError());
    }
}
