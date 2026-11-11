package com.smartphoneai.repository;

import com.smartphoneai.entity.AiChatReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface AiChatReceiptRepository extends JpaRepository<AiChatReceipt, UUID> {
    Optional<AiChatReceipt> findByConversationIdAndRequestId(UUID conversationId, UUID requestId);
}
