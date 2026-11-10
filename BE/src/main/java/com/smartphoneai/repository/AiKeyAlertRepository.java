package com.smartphoneai.repository;

import com.smartphoneai.entity.AiKeyAlert;
import java.util.Optional;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiKeyAlertRepository extends JpaRepository<AiKeyAlert, Long> {
    Optional<AiKeyAlert> findFirstByConfigIdOrderByIdDesc(Long configId);

    @Query("select max(a.id) from AiKeyAlert a join AiProviderConfig c on c.id = a.configId where c.provider = 'GEMINI'")
    Long findLatestGeminiId();

    @Query("select a from AiKeyAlert a join AiProviderConfig c on c.id = a.configId "
            + "where c.provider = 'GEMINI' and a.id <= :throughId order by a.id desc")
    List<AiKeyAlert> findGeminiHistory(@Param("throughId") long throughId, Pageable pageable);

    @Query("select count(a) from AiKeyAlert a join AiProviderConfig c on c.id = a.configId "
            + "where c.provider = 'GEMINI' and a.id > :readThroughId and a.id <= :throughId")
    long countUnreadGemini(@Param("readThroughId") long readThroughId, @Param("throughId") long throughId);

    @Query("select a from AiKeyAlert a where a.configId in :configIds and a.id = "
            + "(select max(recovery.id) from AiKeyAlert recovery where recovery.configId = a.configId "
            + "and recovery.status = 'PRIMARY' and recovery.id <= :throughId)")
    List<AiKeyAlert> findLatestRecoveriesForConfigs(@Param("configIds") Collection<Long> configIds,
                                                   @Param("throughId") long throughId);
}
