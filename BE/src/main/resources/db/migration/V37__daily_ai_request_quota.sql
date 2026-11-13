CREATE TABLE ai_daily_request_usage (
    id UUID PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    key_fingerprint VARCHAR(64) NOT NULL,
    model VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_ai_daily_request_usage ON ai_daily_request_usage(provider,model,key_fingerprint,requested_at);
CREATE TABLE ai_daily_request_limits (
    provider VARCHAR(32) NOT NULL,
    project_id UUID NOT NULL REFERENCES ai_quota_projects(id),
    model VARCHAR(255) NOT NULL,
    request_limit BIGINT NOT NULL CHECK (request_limit > 0),
    limit_source VARCHAR(16) NOT NULL,
    PRIMARY KEY (provider,project_id,model)
);
CREATE TABLE ai_daily_observed_limits (
    provider VARCHAR(32) NOT NULL,
    key_fingerprint VARCHAR(64) NOT NULL,
    project_id UUID NOT NULL REFERENCES ai_quota_projects(id),
    model VARCHAR(255) NOT NULL,
    request_limit BIGINT NOT NULL CHECK (request_limit > 0),
    observed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (provider,key_fingerprint,model)
);
