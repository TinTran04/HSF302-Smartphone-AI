package com.smartphoneai.repository;
import com.smartphoneai.entity.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, UUID> {
    void deleteAllByDocumentId(UUID documentId);
}
