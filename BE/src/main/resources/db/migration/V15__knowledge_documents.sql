CREATE TABLE knowledge_documents (
    id UUID PRIMARY KEY, name VARCHAR(255) NOT NULL, size BIGINT NOT NULL, pages_json TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL, content_updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(255) NOT NULL, enabled BOOLEAN NOT NULL DEFAULT TRUE,
    embedding_version VARCHAR(255), error VARCHAR(255), version BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE knowledge_chunks (
    id UUID PRIMARY KEY, document_id UUID NOT NULL REFERENCES knowledge_documents(id),
    page_number INTEGER, content TEXT NOT NULL, embedding_version VARCHAR(255) NOT NULL
);
CREATE INDEX idx_knowledge_chunks_document ON knowledge_chunks(document_id);
