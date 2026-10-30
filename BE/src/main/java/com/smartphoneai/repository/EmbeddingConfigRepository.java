package com.smartphoneai.repository;
import com.smartphoneai.entity.EmbeddingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface EmbeddingConfigRepository extends JpaRepository<EmbeddingConfig, Long> {
    Optional<EmbeddingConfig> findByActiveTrue();
}
