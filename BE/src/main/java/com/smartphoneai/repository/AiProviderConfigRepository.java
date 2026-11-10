package com.smartphoneai.repository;
import com.smartphoneai.entity.AiProviderConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface AiProviderConfigRepository extends JpaRepository<AiProviderConfig, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from AiProviderConfig c where c.id = :id")
    Optional<AiProviderConfig> findLockedById(@Param("id") Long id);
    Optional<AiProviderConfig> findFirstByProviderOrderByIdDesc(String provider);
    List<AiProviderConfig> findAllByActiveTrue();
    List<AiProviderConfig> findAllByOrderByIdDesc();
}
