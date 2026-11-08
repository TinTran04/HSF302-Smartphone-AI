package com.smartphoneai.repository;

import com.smartphoneai.entity.RefreshSession;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RefreshSessionRepository extends JpaRepository<RefreshSession, UUID> {
    interface Identity { UUID getId(); UUID getUserId(); }
    @Query("select s.id as id, s.userId as userId from RefreshSession s where s.tokenHash = :tokenHash")
    Optional<Identity> findIdentityByTokenHash(@Param("tokenHash") String tokenHash);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from RefreshSession s where s.id = :id")
    Optional<RefreshSession> findLockedById(@Param("id") UUID id);
}
