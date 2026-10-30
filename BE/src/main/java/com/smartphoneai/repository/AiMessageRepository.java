package com.smartphoneai.repository;
import com.smartphoneai.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findAllByConversationIdOrderByIdAsc(UUID conversationId);
    boolean existsByConversationId(UUID conversationId);
}
