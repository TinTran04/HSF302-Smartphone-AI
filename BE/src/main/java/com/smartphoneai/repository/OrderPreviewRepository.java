package com.smartphoneai.repository;
import com.smartphoneai.entity.OrderPreview;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
public interface OrderPreviewRepository extends JpaRepository<OrderPreview, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from OrderPreview p where p.id = :id and p.userId = :userId")
    Optional<OrderPreview> findLocked(@Param("id") UUID id, @Param("userId") UUID userId);
    // Checkout owns preview before variant; fail immediately instead of waiting in the reverse order.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "0"))
    @Query("select p from OrderPreview p where exists (select i from OrderPreviewItem i where i.preview = p and i.variantId in :variantIds) order by p.id")
    List<OrderPreview> findAffectedLocked(@Param("variantIds") List<Long> variantIds);
}
