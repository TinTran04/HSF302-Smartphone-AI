-- Match the immutable source URL so Admin-renamed dataset products are included.
-- Keep each existing custom gallery image and custom variant image.
UPDATE product_images
SET url = (
    SELECT image.image_url
    FROM phone_dataset_images image
    JOIN product_specifications spec ON spec.spec_value = image.source_url AND spec.spec_name = 'URL nguồn'
    WHERE spec.product_id = product_images.product_id
)
WHERE COALESCE(TRIM(url), '') IN ('', '/images/placeholder.svg')
AND EXISTS (
    SELECT 1 FROM phone_dataset_images image
    JOIN product_specifications spec ON spec.spec_value = image.source_url AND spec.spec_name = 'URL nguồn'
    WHERE spec.product_id = product_images.product_id
);

UPDATE product_variants
SET image = (
    SELECT image.image_url
    FROM phone_dataset_images image
    JOIN product_specifications spec ON spec.spec_value = image.source_url AND spec.spec_name = 'URL nguồn'
    WHERE spec.product_id = product_variants.product_id
)
WHERE COALESCE(TRIM(image), '') IN ('', '/images/placeholder.svg')
AND EXISTS (
    SELECT 1 FROM phone_dataset_images image
    JOIN product_specifications spec ON spec.spec_value = image.source_url AND spec.spec_name = 'URL nguồn'
    WHERE spec.product_id = product_variants.product_id
);

INSERT INTO product_images (product_id, position, url)
SELECT spec.product_id, 0, image.image_url
FROM phone_dataset_images image
JOIN product_specifications spec ON spec.spec_value = image.source_url AND spec.spec_name = 'URL nguồn'
WHERE NOT EXISTS (
    SELECT 1 FROM product_images existing WHERE existing.product_id = spec.product_id
);
