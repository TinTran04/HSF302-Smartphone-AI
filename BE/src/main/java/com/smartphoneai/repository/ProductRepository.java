package com.smartphoneai.repository;

import com.smartphoneai.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByIdAndActiveTrue(Long id);
    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String query, Pageable pageable);
    boolean existsByBrandId(Long brandId);
    @Query("select p from Product p where lower(p.name) like lower(concat('%', :query, '%')) and (:active is null or p.active = :active)")
    Page<Product> searchAdmin(@Param("query") String query, @Param("active") Boolean active, Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findLocked(@Param("id") Long id);
    @Query("""
        select p from Product p where p.active = true
        and lower(p.name) like lower(concat('%', :query, '%'))
        and (:brandId is null or p.brand.id = :brandId)
        and (:ram is null or exists (select 1 from Product rp join rp.specifications spec
          where rp = p and lower(key(spec)) = 'ram'
          and lower(replace(spec, ' ', '')) = lower(replace(:ram, ' ', ''))))
        and (:filterVariants = false or exists (select v.id from ProductVariant v
          where v.product = p and v.active = true
          and (:minPrice is null or v.price >= :minPrice)
          and (:maxPrice is null or v.price <= :maxPrice)
          and (:storage is null or lower(v.storage) = lower(:storage))))
        order by
          case when :sort in ('price,asc', 'price,desc') and (select min(v.price) from ProductVariant v where v.product = p and v.active = true) is null then 1 else 0 end asc,
          case when :sort = 'price,asc' then (select min(v.price) from ProductVariant v where v.product = p and v.active = true) end asc,
          case when :sort = 'price,desc' then (select min(v.price) from ProductVariant v where v.product = p and v.active = true) end desc,
          case when :sort = 'name,asc' then lower(p.name) end asc,
          case when :sort = 'name,desc' then lower(p.name) end desc,
          p.id asc
        """)
    Page<Product> searchActive(@Param("query") String query, @Param("brandId") Long brandId,
            @Param("filterVariants") boolean filterVariants, @Param("minPrice") Long minPrice,
            @Param("maxPrice") Long maxPrice, @Param("storage") String storage,
            @Param("ram") String ram, @Param("sort") String sort, Pageable pageable);
}
