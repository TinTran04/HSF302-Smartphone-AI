package com.smartphoneai.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "guest_cart_merge_receipts")
public class GuestCartMergeReceipt {
    @Id @Column(name = "merge_id") private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Column(name = "payload_hash", nullable = false, length = 64) private String payloadHash;

    protected GuestCartMergeReceipt() {}

    public boolean matches(UUID userId, String payloadHash) {
        return this.userId.equals(userId) && this.payloadHash.equals(payloadHash);
    }
}
