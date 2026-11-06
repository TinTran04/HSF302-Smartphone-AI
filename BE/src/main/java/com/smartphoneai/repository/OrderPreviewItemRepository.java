package com.smartphoneai.repository;

import com.smartphoneai.entity.OrderPreviewItem;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderPreviewItemRepository extends JpaRepository<OrderPreviewItem, UUID> {
    @Modifying
    @Query("delete from OrderPreviewItem i where i.variantId in :variantIds")
    int deleteByVariantIds(@Param("variantIds") List<Long> variantIds);
}
