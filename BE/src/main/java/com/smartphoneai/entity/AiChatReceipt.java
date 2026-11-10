package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="ai_chat_receipts", uniqueConstraints=@UniqueConstraint(columnNames={"conversation_id","request_id"}))
public class AiChatReceipt {
    @Id private UUID id;
    @Column(name="conversation_id",nullable=false) private UUID conversationId;
    @Column(name="request_id",nullable=false) private UUID requestId;
    @Column(name="content_hash",nullable=false,length=64) private String contentHash;
    @Column(name="response_json",nullable=false,columnDefinition="text") private String responseJson;
    protected AiChatReceipt() {}
    public AiChatReceipt(UUID conversationId, UUID requestId, String contentHash, String responseJson) {
        id=UUID.randomUUID(); this.conversationId=conversationId; this.requestId=requestId;
        this.contentHash=contentHash; this.responseJson=responseJson;
    }
    public String getContentHash() { return contentHash; }
    public String getResponseJson() { return responseJson; }
}
