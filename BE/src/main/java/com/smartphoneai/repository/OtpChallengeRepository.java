package com.smartphoneai.repository;

import com.smartphoneai.entity.OtpChallenge;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, UUID> {
    @Query("select c.email from OtpChallenge c where c.id = :id and c.purpose = 'PASSWORD_RESET' and c.deliverable = true")
    Optional<String> findPasswordResetEmail(@Param("id") UUID id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OtpChallenge> findFirstByEmailAndPurposeOrderByIssuedAtDesc(String email, String purpose);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OtpChallenge c where c.id = :id")
    Optional<OtpChallenge> findLockedById(@Param("id") UUID id);
}
