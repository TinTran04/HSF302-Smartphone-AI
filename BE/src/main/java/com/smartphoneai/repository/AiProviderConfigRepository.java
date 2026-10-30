package com.smartphoneai.repository;
import com.smartphoneai.entity.AiProviderConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface AiProviderConfigRepository extends JpaRepository<AiProviderConfig, Long> {
    Optional<AiProviderConfig> findFirstByProviderOrderByIdDesc(String provider);
    List<AiProviderConfig> findAllByActiveTrue();
    List<AiProviderConfig> findAllByOrderByIdDesc();
}
