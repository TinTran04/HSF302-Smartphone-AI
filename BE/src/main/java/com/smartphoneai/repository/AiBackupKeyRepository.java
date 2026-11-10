package com.smartphoneai.repository;

import com.smartphoneai.entity.AiBackupKey;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiBackupKeyRepository extends JpaRepository<AiBackupKey, Long> {
    List<AiBackupKey> findAllByConfigIdOrderByPriorityAsc(Long configId);
}
