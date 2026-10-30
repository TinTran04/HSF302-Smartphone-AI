package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="ai_messages")
public class AiMessage {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="conversation_id", nullable=false) private UUID conversationId;
    @Column(nullable=false) private String role;
    @Column(nullable=false, columnDefinition="text") private String content;
    @Column(name="sources_json", nullable=false, columnDefinition="text") private String sourcesJson;
    @Column(name="recommendations_json", nullable=false, columnDefinition="text") private String recommendationsJson;
    @Column(name="comparisons_json", nullable=false, columnDefinition="text") private String comparisonsJson;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    protected AiMessage() {}
    public AiMessage(UUID conversationId, String role, String content, String sourcesJson, String recommendationsJson, String comparisonsJson, Instant now) {
        this.conversationId=conversationId; this.role=role; this.content=content; this.sourcesJson=sourcesJson;
        this.recommendationsJson=recommendationsJson; this.comparisonsJson=comparisonsJson; createdAt=now;
    }
    public Long getId() { return id; } public String getRole() { return role; }
    public String getContent() { return content; } public String getSourcesJson() { return sourcesJson; }
    public String getRecommendationsJson() { return recommendationsJson; } public String getComparisonsJson() { return comparisonsJson; }
}
