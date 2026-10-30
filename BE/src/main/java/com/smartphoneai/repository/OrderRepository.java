package com.smartphoneai.repository;
import com.smartphoneai.entity.OrderRecord;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface OrderRepository extends JpaRepository<OrderRecord, UUID> {
    long countByStatus(com.smartphoneai.entity.OrderStatus status);
    Optional<OrderRecord> findByUserIdAndIdempotencyKey(UUID userId, String key);
    List<OrderRecord> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<OrderRecord> findByIdAndUserId(UUID id, UUID userId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OrderRecord o where o.id = :id")
    Optional<OrderRecord> findLocked(@Param("id") UUID id);
}
