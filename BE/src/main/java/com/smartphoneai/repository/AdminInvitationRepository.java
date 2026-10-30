package com.smartphoneai.repository;

import com.smartphoneai.entity.AdminInvitation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface AdminInvitationRepository extends JpaRepository<AdminInvitation, UUID> {
    Optional<AdminInvitation> findByUserId(UUID userId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from AdminInvitation i where i.tokenHash = :hash")
    Optional<AdminInvitation> findLockedByTokenHash(@Param("hash") String hash);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from AdminInvitation i where i.id = :id")
    Optional<AdminInvitation> findLockedById(@Param("id") UUID id);
}
