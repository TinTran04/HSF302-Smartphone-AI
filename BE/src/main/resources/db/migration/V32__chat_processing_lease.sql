ALTER TABLE ai_conversations ADD COLUMN processing_token UUID;
ALTER TABLE ai_conversations ADD COLUMN processing_until TIMESTAMP WITH TIME ZONE;
