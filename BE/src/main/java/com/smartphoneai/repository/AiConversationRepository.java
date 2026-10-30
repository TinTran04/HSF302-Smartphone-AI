package com.smartphoneai.repository;
import com.smartphoneai.entity.AiConversation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {
    List<AiConversation> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    List<AiConversation> findAllByGuestIdOrderByCreatedAtDesc(UUID guestId);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select c from AiConversation c where c.id = :id")
    Optional<AiConversation> findLocked(@Param("id") UUID id);
}
