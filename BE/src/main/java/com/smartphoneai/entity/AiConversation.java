package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="ai_conversations")
public class AiConversation {
    @Id private UUID id;
    @Column(name="user_id") private UUID userId;
    @Column(name="guest_id") private UUID guestId;
    @Column(nullable=false) private String topic;
    @Column(nullable=false) private String title;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Column(name="product_ids", nullable=false, columnDefinition="text") private String productIds;
    @Version private long version;
    protected AiConversation() {}
    public AiConversation(UUID userId, UUID guestId, String topic, String productIds, Instant now) {
        id=UUID.randomUUID(); this.userId=userId; this.guestId=guestId; this.topic=topic;
        this.title=topic; this.productIds=productIds; this.createdAt=now;
    }
    public UUID getId() { return id; } public UUID getUserId() { return userId; } public UUID getGuestId() { return guestId; }
    public String getTopic() { return topic; } public String getTitle() { return title; } public String getProductIds() { return productIds; }
    public void assignTo(UUID userId) { this.userId=userId; this.guestId=null; }
}
