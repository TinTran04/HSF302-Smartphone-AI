CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    maintenance_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    version BIGINT NOT NULL DEFAULT 0
);
INSERT INTO system_settings (id, maintenance_enabled, version) VALUES (1, FALSE, 0);
