package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="ai_topic_switch_requests")
public class AiTopicSwitch {
    @Id private UUID id;
    @Column(name="conversation_id", nullable=false) private UUID conversationId;
    @Column(name="suggested_topic", nullable=false) private String suggestedTopic;
    @Column(nullable=false, columnDefinition="text") private String question;
    @Column(nullable=false) private String status;
    @Column(name="new_conversation_id") private UUID newConversationId;
    @Column(name="expires_at", nullable=false) private Instant expiresAt;
    @Version private long version;
    protected AiTopicSwitch() {}
    public AiTopicSwitch(UUID conversationId, String suggestedTopic, String question, Instant now) {
        id=UUID.randomUUID(); this.conversationId=conversationId; this.suggestedTopic=suggestedTopic;
        this.question=question; status="PENDING"; expiresAt=now.plusSeconds(600);
    }
    public UUID getId() { return id; } public UUID getConversationId() { return conversationId; }
    public String getSuggestedTopic() { return suggestedTopic; } public String getQuestion() { return question; }
    public String getStatus() { return status; } public UUID getNewConversationId() { return newConversationId; }
    public boolean canConfirm(Instant now) { return "PENDING".equals(status) && now.isBefore(expiresAt); }
    public void confirm(UUID id) { status="CONFIRMED"; newConversationId=id; }
    public void cancel() { status="CANCELLED"; }
    public void expire() { status="EXPIRED"; }
}
