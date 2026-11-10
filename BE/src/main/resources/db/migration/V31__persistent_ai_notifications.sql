ALTER TABLE ai_key_alerts ADD COLUMN backup_key_name VARCHAR(80);
ALTER TABLE users ADD COLUMN ai_notifications_read_through_id BIGINT NOT NULL DEFAULT 0;
