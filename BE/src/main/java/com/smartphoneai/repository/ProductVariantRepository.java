package com.smartphoneai.repository;
import com.smartphoneai.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    @Query("select v.id from ProductVariant v where v.product.id = :productId order by v.id")
    List<Long> findIdsByProductId(@Param("productId") Long productId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from ProductVariant v where v.id = :id")
    Optional<ProductVariant> findLocked(@Param("id") Long id);
}
