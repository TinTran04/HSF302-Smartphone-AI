CREATE TABLE carts (
    user_id UUID PRIMARY KEY REFERENCES users(id)
);
CREATE TABLE cart_items (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES carts(user_id),
    variant_id BIGINT NOT NULL REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_add BIGINT NOT NULL CHECK (price_at_add >= 0),
    version BIGINT NOT NULL DEFAULT 0,
    UNIQUE (user_id, variant_id)
);
