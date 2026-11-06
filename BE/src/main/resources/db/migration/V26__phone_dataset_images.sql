-- Exact-model image sources, byte hashes and rights attribution are recorded in datasets/phones/images.json.
-- Frozen image mapping for previously imported dataset products.
CREATE TABLE phone_dataset_images (
    source_url VARCHAR(255) PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL
);

INSERT INTO phone_dataset_images (source_url, image_url) VALUES
('https://www.mobiledokan.co/product/apple-iphone-16-plus/', '/images/phones/apple-iphone-16-plus.webp'),
('https://www.mobiledokan.co/product/apple-iphone-16-pro-max/', '/images/phones/apple-iphone-16-pro-max.webp'),
('https://www.mobiledokan.co/product/apple-iphone-16-pro/', '/images/phones/apple-iphone-16-pro.webp'),
('https://www.mobiledokan.co/product/apple-iphone-16/', '/images/phones/apple-iphone-16.webp'),
('https://www.mobiledokan.co/product/apple-iphone-16e/', '/images/phones/apple-iphone-16e.webp'),
('https://www.mobiledokan.co/product/apple-iphone-17-air/', '/images/phones/apple-iphone-17-air.webp'),
('https://www.mobiledokan.co/product/apple-iphone-17-pro-max/', '/images/phones/apple-iphone-17-pro-max.webp'),
('https://www.mobiledokan.co/product/apple-iphone-17-pro/', '/images/phones/apple-iphone-17-pro.webp'),
('https://www.mobiledokan.co/product/apple-iphone-17/', '/images/phones/apple-iphone-17.webp'),
('https://www.mobiledokan.co/product/apple-iphone-17e/', '/images/phones/apple-iphone-17e.webp'),
('https://www.mobiledokan.co/product/asus-rog-phone-9-fe/', '/images/phones/asus-rog-phone-9-fe.webp'),
('https://www.mobiledokan.co/product/asus-rog-phone-9-pro/', '/images/phones/asus-rog-phone-9-pro.webp'),
('https://www.mobiledokan.co/product/asus-rog-phone-9/', '/images/phones/asus-rog-phone-9.webp'),
('https://www.mobiledokan.co/product/asus-zenfone-11-ultra/', '/images/phones/asus-zenfone-11-ultra.webp'),
('https://www.mobiledokan.co/product/asus-zenfone-12-ultra/', '/images/phones/asus-zenfone-12-ultra.webp'),
('https://www.mobiledokan.co/product/google-pixel-10-pro-fold/', '/images/phones/google-pixel-10-pro-fold.webp'),
('https://www.mobiledokan.co/product/google-pixel-10a/', '/images/phones/google-pixel-10a.webp'),
('https://www.mobiledokan.co/product/google-pixel-11-pro-fold/', '/images/phones/google-pixel-11-pro-fold.webp'),
('https://www.mobiledokan.co/product/google-pixel-11-pro-xl/', '/images/phones/google-pixel-11-pro-xl.webp'),
('https://www.mobiledokan.co/product/google-pixel-11-pro/', '/images/phones/google-pixel-11-pro.webp'),
('https://www.mobiledokan.co/product/google-pixel-11/', '/images/phones/google-pixel-11.webp'),
('https://www.mobiledokan.co/product/google-pixel-8a/', '/images/phones/google-pixel-8a.webp'),
('https://www.mobiledokan.co/product/google-pixel-9-pro-fold/', '/images/phones/google-pixel-9-pro-fold.webp'),
('https://www.mobiledokan.co/product/google-pixel-9-pro-xl/', '/images/phones/google-pixel-9-pro-xl.webp'),
('https://www.mobiledokan.co/product/google-pixel-9-pro/', '/images/phones/google-pixel-9-pro.webp'),
('https://www.mobiledokan.co/product/google-pixel-9/', '/images/phones/google-pixel-9.webp'),
('https://www.mobiledokan.co/product/google-pixel-9a/', '/images/phones/google-pixel-9a.webp'),
('https://www.mobiledokan.co/product/honor-400-china/', '/images/phones/honor-400-china.webp'),
('https://www.mobiledokan.co/product/honor-400-lite/', '/images/phones/honor-400-lite.webp'),
('https://www.mobiledokan.co/product/honor-400-pro-china/', '/images/phones/honor-400-pro-china.webp'),
('https://www.mobiledokan.co/product/honor-400-pro/', '/images/phones/honor-400-pro.webp'),
('https://www.mobiledokan.co/product/honor-400/', '/images/phones/honor-400.webp'),
('https://www.mobiledokan.co/product/honor-gt-pro/', '/images/phones/honor-gt-pro.webp'),
('https://www.mobiledokan.co/product/honor-play-60/', '/images/phones/honor-play-60.webp'),
('https://www.mobiledokan.co/product/honor-power/', '/images/phones/honor-power.webp'),
('https://www.mobiledokan.co/product/honor-x60-gt/', '/images/phones/honor-x60-gt.webp'),
('https://www.mobiledokan.co/product/honor-x6c/', '/images/phones/honor-x6c.webp'),
('https://www.mobiledokan.co/product/honor-x70i/', '/images/phones/honor-x70i.webp'),
('https://www.mobiledokan.co/product/honor-x8c/', '/images/phones/honor-x8c.webp'),
('https://www.mobiledokan.co/product/motorola-edge-2025/', '/images/phones/motorola-edge-2025.webp'),
('https://www.mobiledokan.co/product/motorola-edge-60-pro/', '/images/phones/motorola-edge-60-pro.webp'),
('https://www.mobiledokan.co/product/motorola-edge-60/', '/images/phones/motorola-edge-60.webp'),
('https://www.mobiledokan.co/product/motorola-edge-60s/', '/images/phones/motorola-edge-60s.webp'),
('https://www.mobiledokan.co/product/motorola-moto-g-2026/', '/images/phones/motorola-moto-g-2026.webp'),
('https://www.mobiledokan.co/product/motorola-moto-g56/', '/images/phones/motorola-moto-g56.webp'),
('https://www.mobiledokan.co/product/motorola-moto-g77-power/', '/images/phones/motorola-moto-g77-power.webp'),
('https://www.mobiledokan.co/product/motorola-moto-g86-power/', '/images/phones/motorola-moto-g86-power.webp'),
('https://www.mobiledokan.co/product/motorola-moto-g86/', '/images/phones/motorola-moto-g86.webp'),
('https://www.mobiledokan.co/product/motorola-razr-2025/', '/images/phones/motorola-razr-2025.webp'),
('https://www.mobiledokan.co/product/motorola-razr-plus-2025/', '/images/phones/motorola-razr-plus-2025.webp'),
('https://www.mobiledokan.co/product/motorola-razr-ultra-2025/', '/images/phones/motorola-razr-ultra-2025.webp'),
('https://www.mobiledokan.co/product/nothing-cmf-phone-1/', '/images/phones/nothing-cmf-phone-1.webp'),
('https://www.mobiledokan.co/product/nothing-cmf-phone-2-pro/', '/images/phones/nothing-cmf-phone-2-pro.webp'),
('https://www.mobiledokan.co/product/nothing-phone-2a-plus/', '/images/phones/nothing-phone-2a-plus.webp'),
('https://www.mobiledokan.co/product/nothing-phone-3/', '/images/phones/nothing-phone-3.webp'),
('https://www.mobiledokan.co/product/nothing-phone-3a-lite/', '/images/phones/nothing-phone-3a-lite.webp'),
('https://www.mobiledokan.co/product/nothing-phone-3a-pro/', '/images/phones/nothing-phone-3a-pro.webp'),
('https://www.mobiledokan.co/product/nothing-phone-3a/', '/images/phones/nothing-phone-3a.webp'),
('https://www.mobiledokan.co/product/nothing-phone-4a-pro/', '/images/phones/nothing-phone-4a-pro.webp'),
('https://www.mobiledokan.co/product/nothing-phone-4a/', '/images/phones/nothing-phone-4a.webp'),
('https://www.mobiledokan.co/product/nothing-phone-4b/', '/images/phones/nothing-phone-4b.webp'),
('https://www.mobiledokan.co/product/oneplus-13/', '/images/phones/oneplus-13.webp'),
('https://www.mobiledokan.co/product/oneplus-13r/', '/images/phones/oneplus-13r.webp'),
('https://www.mobiledokan.co/product/oneplus-13s/', '/images/phones/oneplus-13s.webp'),
('https://www.mobiledokan.co/product/oneplus-13t/', '/images/phones/oneplus-13t.webp'),
('https://www.mobiledokan.co/product/oneplus-ace-5-pro/', '/images/phones/oneplus-ace-5-pro.webp'),
('https://www.mobiledokan.co/product/oneplus-ace-5-racing/', '/images/phones/oneplus-ace-5-racing.webp'),
('https://www.mobiledokan.co/product/oneplus-ace-5-ultra/', '/images/phones/oneplus-ace-5-ultra.webp'),
('https://www.mobiledokan.co/product/oneplus-ace-5/', '/images/phones/oneplus-ace-5.webp'),
('https://www.mobiledokan.co/product/oneplus-n6/', '/images/phones/oneplus-n6.webp'),
('https://www.mobiledokan.co/product/oneplus-nord-4/', '/images/phones/oneplus-nord-4.webp'),
('https://www.mobiledokan.co/product/oneplus-turbo-6x-pro/', '/images/phones/oneplus-turbo-6x-pro.webp'),
('https://www.mobiledokan.co/product/oneplus-turbo-6x/', '/images/phones/oneplus-turbo-6x.webp'),
('https://www.mobiledokan.co/product/oppo-a5-4g/', '/images/phones/oppo-a5-4g.webp'),
('https://www.mobiledokan.co/product/oppo-a5/', '/images/phones/oppo-a5.webp'),
('https://www.mobiledokan.co/product/oppo-a5x-4g/', '/images/phones/oppo-a5x-4g.webp'),
('https://www.mobiledokan.co/product/oppo-a5x/', '/images/phones/oppo-a5x.webp'),
('https://www.mobiledokan.co/product/oppo-find-x8-ultra/', '/images/phones/oppo-find-x8-ultra.webp'),
('https://www.mobiledokan.co/product/oppo-find-x8s/', '/images/phones/oppo-find-x8s.webp'),
('https://www.mobiledokan.co/product/oppo-k13/', '/images/phones/oppo-k13.webp'),
('https://www.mobiledokan.co/product/oppo-k13x/', '/images/phones/oppo-k13x.webp'),
('https://www.mobiledokan.co/product/oppo-reno14-f/', '/images/phones/oppo-reno14-f.webp'),
('https://www.mobiledokan.co/product/oppo-reno14-pro/', '/images/phones/oppo-reno14-pro.webp'),
('https://www.mobiledokan.co/product/oppo-reno14/', '/images/phones/oppo-reno14.webp'),
('https://www.mobiledokan.co/product/oppo-reno16c/', '/images/phones/oppo-reno16c.webp'),
('https://www.mobiledokan.co/product/realme-14/', '/images/phones/realme-14.webp'),
('https://www.mobiledokan.co/product/realme-14t/', '/images/phones/realme-14t.webp'),
('https://www.mobiledokan.co/product/realme-c71/', '/images/phones/realme-c71.webp'),
('https://www.mobiledokan.co/product/realme-c73/', '/images/phones/realme-c73.webp'),
('https://www.mobiledokan.co/product/realme-c75/', '/images/phones/realme-c75.webp'),
('https://www.mobiledokan.co/product/realme-gt-7/', '/images/phones/realme-gt-7.webp'),
('https://www.mobiledokan.co/product/realme-gt-7t/', '/images/phones/realme-gt-7t.webp'),
('https://www.mobiledokan.co/product/realme-gt7-china/', '/images/phones/realme-gt7-china.webp'),
('https://www.mobiledokan.co/product/realme-narzo-80-lite/', '/images/phones/realme-narzo-80-lite.webp'),
('https://www.mobiledokan.co/product/realme-narzo-80-pro/', '/images/phones/realme-narzo-80-pro.webp'),
('https://www.mobiledokan.co/product/realme-narzo-80x/', '/images/phones/realme-narzo-80x.webp'),
('https://www.mobiledokan.co/product/realme-neo7-turbo/', '/images/phones/realme-neo7-turbo.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-a26/', '/images/phones/samsung-galaxy-a26.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-a36/', '/images/phones/samsung-galaxy-a36.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-a56/', '/images/phones/samsung-galaxy-a56.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-f16/', '/images/phones/samsung-galaxy-f16.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-f56/', '/images/phones/samsung-galaxy-f56.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-m06/', '/images/phones/samsung-galaxy-m06.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-m16/', '/images/phones/samsung-galaxy-m16.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-m17/', '/images/phones/samsung-galaxy-m17.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-m47/', '/images/phones/samsung-galaxy-m47.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-m56/', '/images/phones/samsung-galaxy-m56.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-s25-edge/', '/images/phones/samsung-galaxy-s25-edge.webp'),
('https://www.mobiledokan.co/product/samsung-galaxy-xcover7-pro/', '/images/phones/samsung-galaxy-xcover7-pro.webp'),
('https://www.mobiledokan.co/product/sony-xperia-1-vi/', '/images/phones/sony-xperia-1-vi.webp'),
('https://www.mobiledokan.co/product/sony-xperia-1-vii/', '/images/phones/sony-xperia-1-vii.webp'),
('https://www.mobiledokan.co/product/sony-xperia-1-viii/', '/images/phones/sony-xperia-1-viii.webp'),
('https://www.mobiledokan.co/product/sony-xperia-10-vi/', '/images/phones/sony-xperia-10-vi.webp'),
('https://www.mobiledokan.co/product/sony-xperia-10-vii/', '/images/phones/sony-xperia-10-vii.webp'),
('https://www.mobiledokan.co/product/vivo-iqoo-neo10-pro-plus/', '/images/phones/vivo-iqoo-neo10-pro-plus.webp'),
('https://www.mobiledokan.co/product/vivo-iqoo-neo10/', '/images/phones/vivo-iqoo-neo10.webp'),
('https://www.mobiledokan.co/product/vivo-iqoo-z10-lite/', '/images/phones/vivo-iqoo-z10-lite.webp'),
('https://www.mobiledokan.co/product/vivo-s30-pro-mini/', '/images/phones/vivo-s30-pro-mini.webp'),
('https://www.mobiledokan.co/product/vivo-s30/', '/images/phones/vivo-s30.webp'),
('https://www.mobiledokan.co/product/vivo-t4-lite/', '/images/phones/vivo-t4-lite.webp'),
('https://www.mobiledokan.co/product/vivo-t4-ultra/', '/images/phones/vivo-t4-ultra.webp'),
('https://www.mobiledokan.co/product/vivo-x-fold5/', '/images/phones/vivo-x-fold5.webp'),
('https://www.mobiledokan.co/product/vivo-x200-fe/', '/images/phones/vivo-x200-fe.webp'),
('https://www.mobiledokan.co/product/vivo-y19s-pro/', '/images/phones/vivo-y19s-pro.webp'),
('https://www.mobiledokan.co/product/vivo-y400-pro/', '/images/phones/vivo-y400-pro.webp'),
('https://www.mobiledokan.co/product/vivo-y500/', '/images/phones/vivo-y500.webp'),
('https://www.mobiledokan.co/product/xiaomi-15s-pro/', '/images/phones/xiaomi-15s-pro.webp'),
('https://www.mobiledokan.co/product/xiaomi-civi-5-pro/', '/images/phones/xiaomi-civi-5-pro.webp'),
('https://www.mobiledokan.co/product/xiaomi-poco-c71/', '/images/phones/xiaomi-poco-c71.webp'),
('https://www.mobiledokan.co/product/xiaomi-poco-f7-pro/', '/images/phones/xiaomi-poco-f7-pro.webp'),
('https://www.mobiledokan.co/product/xiaomi-poco-f7-ultra/', '/images/phones/xiaomi-poco-f7-ultra.webp'),
('https://www.mobiledokan.co/product/xiaomi-poco-f7/', '/images/phones/xiaomi-poco-f7.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-13x/', '/images/phones/xiaomi-redmi-13x.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-a5-4g/', '/images/phones/xiaomi-redmi-a5-4g.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-k90-ultra/', '/images/phones/xiaomi-redmi-k90-ultra.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-note-14s/', '/images/phones/xiaomi-redmi-note-14s.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-note-17-china/', '/images/phones/xiaomi-redmi-note-17-china.webp'),
('https://www.mobiledokan.co/product/xiaomi-redmi-turbo-4-pro/', '/images/phones/xiaomi-redmi-turbo-4-pro.webp');

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

DROP TABLE phone_dataset_images;
