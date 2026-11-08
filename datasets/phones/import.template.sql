-- UTSHO DEY / Kaggle, Global Mobile Phone Specifications & Prices, v1, MIT.
-- Source and conversion details are recorded in the accompanying README.md.
-- Prices in this import are illustrative VND values for local testing.
-- Execute the entire file on the migrated PostgreSQL database.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('smartphone-ai-phone-dataset-v1'));

CREATE TEMP TABLE phone_dataset_rows ON COMMIT DROP AS
SELECT *
FROM jsonb_to_recordset($phone_dataset$@@CATALOG_JSON@@$phone_dataset$::jsonb)
AS phone(
    name text, "sourceName" text, brand text, "sourceUrl" text, description text,
    "sourcePriceBdt" bigint, price bigint, color text, storage text, image text, specifications jsonb
);

INSERT INTO brands (name)
SELECT DISTINCT phone.brand
FROM phone_dataset_rows phone
WHERE NOT EXISTS (
    SELECT 1 FROM brands brand WHERE lower(trim(brand.name)) = lower(trim(phone.brand))
)
ON CONFLICT (name) DO NOTHING;

CREATE TEMP TABLE phone_dataset_new ON COMMIT DROP AS
SELECT phone.*, brand.id AS brand_id, nextval(pg_get_serial_sequence('products', 'id')) AS product_id
FROM phone_dataset_rows phone
JOIN LATERAL (
    SELECT id FROM brands WHERE lower(trim(name)) = lower(trim(phone.brand)) ORDER BY id LIMIT 1
) brand ON true
WHERE NOT EXISTS (
    SELECT 1 FROM products product
    JOIN brands existing_brand ON existing_brand.id = product.brand_id
    WHERE (
        lower(trim(existing_brand.name)) = lower(trim(phone.brand))
        AND lower(trim(product.name)) IN (lower(trim(phone.name)), lower(trim(phone."sourceName")))
    ) OR EXISTS (
        SELECT 1 FROM product_specifications spec
        WHERE spec.product_id = product.id AND spec.spec_name = 'URL nguồn' AND spec.spec_value = phone."sourceUrl"
    )
);

INSERT INTO products (id, name, active, brand_id, description)
SELECT product_id, name, true, brand_id, description FROM phone_dataset_new;

INSERT INTO product_variants (product_id, color, storage, price, active, image)
SELECT product_id, color, storage, price, true, image FROM phone_dataset_new;

INSERT INTO product_images (product_id, position, url)
SELECT product_id, 0, image FROM phone_dataset_new;

INSERT INTO product_specifications (product_id, spec_name, spec_value)
SELECT phone.product_id, spec.key, spec.value
FROM phone_dataset_new phone
CROSS JOIN LATERAL jsonb_each_text(phone.specifications) spec;

CREATE TEMP TABLE phone_dataset_images ON COMMIT DROP AS
SELECT "sourceUrl" AS source_url, image AS image_url
FROM phone_dataset_rows
WHERE image LIKE '/images/phones/%';

@@IMAGE_BACKFILL_SQL@@

SELECT count(*) AS imported_products FROM phone_dataset_new;
COMMIT;
