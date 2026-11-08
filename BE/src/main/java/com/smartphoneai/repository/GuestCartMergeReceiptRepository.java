package com.smartphoneai.repository;

import com.smartphoneai.entity.GuestCartMergeReceipt;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GuestCartMergeReceiptRepository extends JpaRepository<GuestCartMergeReceipt, UUID> {
    @Modifying
    @Query(value = "INSERT INTO guest_cart_merge_receipts (merge_id, user_id, payload_hash) VALUES (:mergeId, :userId, :payloadHash)", nativeQuery = true)
    void insert(@Param("mergeId") UUID mergeId, @Param("userId") UUID userId, @Param("payloadHash") String payloadHash);
}
