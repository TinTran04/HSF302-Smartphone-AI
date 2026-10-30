package com.smartphoneai.repository;
import com.smartphoneai.entity.KnowledgeDocument;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, UUID> {
    long countByStatus(String status);
    List<KnowledgeDocument> findAllByOrderByContentUpdatedAtDesc();
    List<KnowledgeDocument> findAllByStatusAndEmbeddingVersion(String status,String embeddingVersion);
    List<KnowledgeDocument> findAllByStatus(String status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select d from KnowledgeDocument d where d.id = :id")
    Optional<KnowledgeDocument> findLocked(@Param("id") UUID id);
}
