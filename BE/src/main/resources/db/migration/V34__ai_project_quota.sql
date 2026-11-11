CREATE TABLE ai_quota_projects (
    id UUID PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE ai_quota_project_limits (
    project_id UUID NOT NULL REFERENCES ai_quota_projects(id),
    model VARCHAR(255) NOT NULL,
    tpm_limit BIGINT NOT NULL CHECK (tpm_limit > 0),
    PRIMARY KEY (project_id, model)
);
CREATE TABLE ai_quota_keys (
    key_fingerprint VARCHAR(64) PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES ai_quota_projects(id)
);
CREATE TABLE ai_quota_usage (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES ai_quota_projects(id),
    model VARCHAR(255) NOT NULL,
    input_tokens BIGINT NOT NULL CHECK (input_tokens >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_ai_quota_usage_window ON ai_quota_usage(project_id, model, created_at);
