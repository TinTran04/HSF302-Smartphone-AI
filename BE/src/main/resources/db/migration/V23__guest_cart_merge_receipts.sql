CREATE TABLE guest_cart_merge_receipts (
    merge_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    payload_hash VARCHAR(64) NOT NULL
);
