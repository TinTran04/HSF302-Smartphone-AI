package com.smartphoneai.repository;
import com.smartphoneai.entity.OrderPreview;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;
public interface OrderPreviewRepository extends JpaRepository<OrderPreview, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from OrderPreview p where p.id = :id and p.userId = :userId")
    Optional<OrderPreview> findLocked(@Param("id") UUID id, @Param("userId") UUID userId);
}
