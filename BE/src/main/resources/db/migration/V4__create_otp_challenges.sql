CREATE TABLE otp_challenges (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX idx_otp_challenges_email_purpose ON otp_challenges(email, purpose);
