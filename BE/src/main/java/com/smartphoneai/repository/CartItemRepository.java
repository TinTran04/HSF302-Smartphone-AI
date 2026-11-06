package com.smartphoneai.repository;
import com.smartphoneai.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findAllByUserId(UUID userId);
    Optional<CartItem> findByUserIdAndVariantId(UUID userId, Long variantId);
    @Modifying
    @Query("delete from CartItem i where i.variant.id in :variantIds")
    int deleteByVariantIds(@Param("variantIds") List<Long> variantIds);
}
