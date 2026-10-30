CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('CUSTOMER','ADMIN')),
    active BOOLEAN NOT NULL DEFAULT FALSE,
    root_key VARCHAR(255) UNIQUE CHECK (root_key IS NULL OR root_key = 'ROOT'),
    version BIGINT NOT NULL DEFAULT 0,
    CHECK (email IS NOT NULL OR username IS NOT NULL)
);
