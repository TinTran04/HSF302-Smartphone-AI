package com.smartphoneai.repository;
import com.smartphoneai.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findAllByUserId(UUID userId);
    Optional<CartItem> findByUserIdAndVariantId(UUID userId, Long variantId);
}
