ALTER TABLE otp_challenges ADD COLUMN reset_token_hash VARCHAR(255);
ALTER TABLE otp_challenges ADD COLUMN reset_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE otp_challenges ADD COLUMN reset_credential_version BIGINT;
