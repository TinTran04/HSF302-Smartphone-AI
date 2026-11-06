ALTER TABLE users ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE users ADD CONSTRAINT users_location_valid CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);

ALTER TABLE order_previews ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE order_previews ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE order_previews ADD CONSTRAINT order_previews_location_valid CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);

ALTER TABLE orders ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE orders ADD CONSTRAINT orders_location_valid CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
);
