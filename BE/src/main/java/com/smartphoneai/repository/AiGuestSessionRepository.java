package com.smartphoneai.repository;
import com.smartphoneai.entity.AiGuestSession;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
public interface AiGuestSessionRepository extends JpaRepository<AiGuestSession, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from AiGuestSession s where s.tokenHash = :hash")
    Optional<AiGuestSession> findLockedByTokenHash(@Param("hash") String hash);
}
