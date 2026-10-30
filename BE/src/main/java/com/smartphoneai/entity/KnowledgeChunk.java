package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="knowledge_chunks")
public class KnowledgeChunk {
    @Id private UUID id;
    @Column(name="document_id",nullable=false) private UUID documentId;
    @Column(name="page_number") private Integer pageNumber;
    @Column(nullable=false,columnDefinition="text") private String content;
    @Column(name="embedding_version",nullable=false) private String embeddingVersion;
    protected KnowledgeChunk() {}
    public KnowledgeChunk(UUID documentId,Integer pageNumber,String content,String embeddingVersion) {
        id=UUID.randomUUID(); this.documentId=documentId; this.pageNumber=pageNumber; this.content=content; this.embeddingVersion=embeddingVersion;
    }
    public UUID getId() { return id; } public UUID getDocumentId() { return documentId; }
    public Integer getPageNumber() { return pageNumber; } public String getContent() { return content; }
    public String getEmbeddingVersion() { return embeddingVersion; }
}
