CREATE TABLE ai_chat_receipts (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    request_id UUID NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    response_json TEXT NOT NULL,
    CONSTRAINT uq_chat_receipt_request UNIQUE (conversation_id, request_id)
);
