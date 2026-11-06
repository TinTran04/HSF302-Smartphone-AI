package com.smartphoneai.repository;
import com.smartphoneai.entity.AiMessage;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findAllByConversationIdOrderByIdAsc(UUID conversationId);
    boolean existsByConversationId(UUID conversationId);
    @Modifying
    @Query("delete from AiMessage m where m.conversationId = :conversationId")
    void deleteConversationMessages(@Param("conversationId") UUID conversationId);
}
