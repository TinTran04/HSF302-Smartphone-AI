CREATE TABLE order_previews (
    id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL,
    note VARCHAR(255) NOT NULL, expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE, version BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE order_preview_items (
    id UUID PRIMARY KEY, preview_id UUID NOT NULL REFERENCES order_previews(id),
    variant_id BIGINT NOT NULL REFERENCES product_variants(id), quantity INTEGER NOT NULL CHECK(quantity > 0),
    old_unit_price BIGINT NOT NULL CHECK(old_unit_price >= 0), unit_price BIGINT NOT NULL CHECK(unit_price >= 0),
    UNIQUE(preview_id, variant_id)
);
CREATE TABLE orders (
    id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id), preview_id UUID NOT NULL REFERENCES order_previews(id),
    idempotency_key VARCHAR(128) NOT NULL, full_name VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL, note VARCHAR(255) NOT NULL, total BIGINT NOT NULL CHECK(total >= 0),
    status VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL, version BIGINT NOT NULL DEFAULT 0,
    UNIQUE(user_id, idempotency_key)
);
CREATE TABLE order_items (
    id UUID PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), variant_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL, color VARCHAR(255) NOT NULL, storage VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0), unit_price BIGINT NOT NULL CHECK(unit_price >= 0)
);
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), status VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE NOT NULL
);
