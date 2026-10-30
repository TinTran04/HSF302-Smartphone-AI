package com.smartphoneai.repository;
import com.smartphoneai.entity.AiTopicSwitch;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface AiTopicSwitchRepository extends JpaRepository<AiTopicSwitch, UUID> {
    Optional<AiTopicSwitch> findFirstByConversationIdAndStatus(UUID conversationId, String status);
    @Query("select s.conversationId from AiTopicSwitch s where s.id = :id")
    Optional<UUID> findConversationId(@Param("id") UUID id);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from AiTopicSwitch s where s.id = :id")
    Optional<AiTopicSwitch> findLocked(@Param("id") UUID id);
}
