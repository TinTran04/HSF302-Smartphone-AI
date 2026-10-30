CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE vector_store (
    id UUID PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector
);
