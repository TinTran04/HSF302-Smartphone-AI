package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="knowledge_documents")
public class KnowledgeDocument {
    @Id private UUID id;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private long size;
    @Column(name="pages_json",nullable=false,columnDefinition="text") private String pagesJson;
    @Column(name="uploaded_at",nullable=false) private Instant uploadedAt;
    @Column(name="content_updated_at",nullable=false) private Instant contentUpdatedAt;
    @Column(nullable=false) private String status;
    @Column(nullable=false) private boolean enabled;
    @Column(name="embedding_version") private String embeddingVersion;
    @Column(name="processing_attempt") private UUID processingAttempt;
    private String error;
    @Version private long version;
    protected KnowledgeDocument() {}
    public KnowledgeDocument(String name,long size,String pagesJson,Instant now) {
        id=UUID.randomUUID(); this.name=name; this.size=size; this.pagesJson=pagesJson;
        uploadedAt=now; contentUpdatedAt=now; status="PROCESSING"; enabled=true; processingAttempt=UUID.randomUUID();
    }
    public void replaceContent(String name,long size,String pagesJson,Instant now) {
        this.name=name; this.size=size; this.pagesJson=pagesJson; contentUpdatedAt=now;
        status="PROCESSING"; embeddingVersion=null; error=null; processingAttempt=UUID.randomUUID();
    }
    public void processing() { status="PROCESSING"; error=null; }
    public void startProcessing() { processingAttempt=UUID.randomUUID(); processing(); }
    public void ready(String embeddingVersion) { this.embeddingVersion=embeddingVersion; status=enabled ? "READY" : "DISABLED"; error=null; }
    public void fail() { embeddingVersion=null; status=enabled ? "FAILED" : "DISABLED"; error="Không thể lập chỉ mục; kiểm tra cấu hình embedding."; }
    public void setEnabled(boolean enabled) {
        if (enabled && this.enabled && "PROCESSING".equals(status)) return;
        this.enabled=enabled;
        status=enabled ? (embeddingVersion==null ? "FAILED" : "READY") : "DISABLED";
        if (enabled && embeddingVersion==null) error="Cần lập chỉ mục lại tài liệu.";
    }
    public UUID getId() { return id; } public String getName() { return name; } public long getSize() { return size; }
    public String getPagesJson() { return pagesJson; } public Instant getUploadedAt() { return uploadedAt; }
    public Instant getContentUpdatedAt() { return contentUpdatedAt; } public String getStatus() { return status; }
    public String getEmbeddingVersion() { return embeddingVersion; } public String getError() { return error; }
    public UUID getProcessingAttempt() { return processingAttempt; }
}
