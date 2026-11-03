-- Xóa dữ liệu cũ nếu có
TRUNCATE TABLE product_specifications, product_images, product_variants, products, brands CASCADE;

-- 1. Chèn thương hiệu
INSERT INTO brands (id, name) VALUES 
(1, 'Apple'),
(2, 'Samsung'),
(3, 'Xiaomi'),
(4, 'OPPO'),
(5, 'vivo');
ALTER TABLE brands ALTER COLUMN id RESTART WITH 6;

-- 2. Chèn sản phẩm
-- Product 1: iPhone 16 Pro Max
INSERT INTO products (id, name, active, brand_id, description) VALUES
(1, 'iPhone 16 Pro Max', true, 1, 'iPhone 16 Pro Max sở hữu màn hình Super Retina XDR 6.9 inch, chip Apple A18 Pro mạnh mẽ và nút điều khiển Camera Control đột phá.');
INSERT INTO product_images (product_id, position, url) VALUES (1, 0, '/images/7a3be82fc743ac21.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(1, 'Chip xử lý', 'Apple A18 Pro 3nm'),
(1, 'RAM', '8 GB'),
(1, 'Màn hình', '6.9 inch OLED 120Hz ProMotion'),
(1, 'Camera', 'Chính 48 MP + Siêu rộng 48 MP + Telephoto 12 MP (Zoom 5x)'),
(1, 'Pin', '4.685 mAh, sạc nhanh 27W'),
(1, 'Hệ điều hành', 'iOS 18');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(1, 'Titan Tự Nhiên', '256GB', 34990000, true, '#ada397', '/images/7a3be82fc743ac21.webp'),
(1, 'Titan Đen', '256GB', 34990000, true, '#343434', '/images/7a3be82fc743ac21.webp'),
(1, 'Titan Tự Nhiên', '512GB', 38990000, true, '#ada397', '/images/7a3be82fc743ac21.webp'),
(1, 'Titan Đen', '512GB', 38990000, true, '#343434', '/images/7a3be82fc743ac21.webp'),
(1, 'Titan Tự Nhiên', '1TB', 43990000, true, '#ada397', '/images/7a3be82fc743ac21.webp');

-- Product 2: Galaxy S24 Ultra
INSERT INTO products (id, name, active, brand_id, description) VALUES
(2, 'Galaxy S24 Ultra', true, 2, 'Galaxy S24 Ultra mang đến quyền năng Galaxy AI vượt trội, bút S-Pen tích hợp, khung viền Titan và camera zoom quang học 200MP ấn tượng.');
INSERT INTO product_images (product_id, position, url) VALUES (2, 0, '/images/3f8cd5940d6aa104.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(2, 'Chip xử lý', 'Snapdragon 8 Gen 3 for Galaxy'),
(2, 'RAM', '12 GB'),
(2, 'Màn hình', '6.8 inch Dynamic AMOLED 2X, 120Hz, 2600 nits'),
(2, 'Camera', '200 MP + 50 MP + 12 MP + 10 MP (Zoom 100x)'),
(2, 'Pin', '5.000 mAh, sạc nhanh 45W'),
(2, 'Hệ điều hành', 'Android 14, One UI 6.1');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(2, 'Titan Xám', '256GB', 28490000, true, '#8b8a86', '/images/3f8cd5940d6aa104.webp'),
(2, 'Titan Đen', '256GB', 28490000, true, '#343434', '/images/3f8cd5940d6aa104.webp'),
(2, 'Titan Xám', '512GB', 32490000, true, '#8b8a86', '/images/3f8cd5940d6aa104.webp'),
(2, 'Titan Xám', '1TB', 37490000, true, '#8b8a86', '/images/3f8cd5940d6aa104.webp');

-- Product 3: iPhone 16 Pro
INSERT INTO products (id, name, active, brand_id, description) VALUES
(3, 'iPhone 16 Pro', true, 1, 'iPhone 16 Pro nhỏ gọn mạnh mẽ với màn hình 6.3 inch, thời lượng pin nâng cấp, camera 48MP Fusion và sức mạnh từ chip A18 Pro.');
INSERT INTO product_images (product_id, position, url) VALUES (3, 0, '/images/d5d763a17ed65b6c.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(3, 'Chip xử lý', 'Apple A18 Pro'),
(3, 'RAM', '8 GB'),
(3, 'Màn hình', '6.3 inch Super Retina XDR OLED'),
(3, 'Camera', '48 MP + 48 MP + 12 MP (Zoom quang 5x)'),
(3, 'Pin', '3.582 mAh, sạc không dây MagSafe'),
(3, 'Hệ điều hành', 'iOS 18');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(3, 'Titan Sa Mạc', '128GB', 28990000, true, '#c4a98a', '/images/d5d763a17ed65b6c.webp'),
(3, 'Titan Đen', '128GB', 28990000, true, '#343434', '/images/d5d763a17ed65b6c.webp'),
(3, 'Titan Sa Mạc', '256GB', 31990000, true, '#c4a98a', '/images/d5d763a17ed65b6c.webp'),
(3, 'Titan Sa Mạc', '512GB', 37990000, true, '#c4a98a', '/images/d5d763a17ed65b6c.webp');

-- Product 4: Xiaomi 14 Ultra
INSERT INTO products (id, name, active, brand_id, description) VALUES
(4, 'Xiaomi 14 Ultra', true, 3, 'Tuyệt tác nhiếp ảnh hợp tác cùng Leica với cụm 4 camera 50MP cảm biến 1 inch, ống kính quang học Summilux và màn hình AMOLED siêu sáng.');
INSERT INTO product_images (product_id, position, url) VALUES (4, 0, '/images/37610803aa06b819.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(4, 'Chip xử lý', 'Snapdragon 8 Gen 3 4nm'),
(4, 'RAM', '16 GB'),
(4, 'Màn hình', '6.73 inch LTPO AMOLED, 120Hz, 3000 nits'),
(4, 'Camera', 'Bộ tứ Leica 50 MP (chính 1 inch, siêu rộng, tele 3.2x, tiềm vọng 5x)'),
(4, 'Pin', '5.000 mAh, sạc siêu tốc 90W'),
(4, 'Hệ điều hành', 'Android 14, Xiaomi HyperOS');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(4, 'Trắng', '512GB', 25990000, true, '#efefec', '/images/37610803aa06b819.webp'),
(4, 'Đen', '512GB', 25990000, true, '#343434', '/images/37610803aa06b819.webp'),
(4, 'Trắng', '1TB', 29990000, true, '#efefec', '/images/37610803aa06b819.webp');

-- Product 5: OPPO Find X7 Ultra
INSERT INTO products (id, name, active, brand_id, description) VALUES
(5, 'OPPO Find X7 Ultra', true, 4, 'Flagship đầu tiên trên thế giới sở hữu camera tiềm vọng kép (Dual Periscope), hệ thống hình ảnh Hasselblad thế hệ mới và thiết kế da sang trọng.');
INSERT INTO product_images (product_id, position, url) VALUES (5, 0, '/images/3e9fdc9f8aac968f.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(5, 'Chip xử lý', 'Snapdragon 8 Gen 3'),
(5, 'RAM', '16 GB'),
(5, 'Màn hình', '6.82 inch AMOLED LTPO 120Hz, 4500 nits đỉnh'),
(5, 'Camera', '4 camera 50 MP Hasselblad, 2 ống kính tiềm vọng'),
(5, 'Pin', '5.000 mAh, sạc SuperVOOC 100W'),
(5, 'Hệ điều hành', 'ColorOS 14');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(5, 'Xanh Đại Dương', '256GB', 21990000, true, '#384c6d', '/images/3e9fdc9f8aac968f.webp'),
(5, 'Nâu Sa Mạc', '256GB', 21990000, true, '#8a6240', '/images/3e9fdc9f8aac968f.webp'),
(5, 'Xanh Đại Dương', '512GB', 24990000, true, '#384c6d', '/images/3e9fdc9f8aac968f.webp');

-- Product 6: vivo X100 Pro
INSERT INTO products (id, name, active, brand_id, description) VALUES
(6, 'vivo X100 Pro', true, 5, 'vivo X100 Pro tích hợp thấu kính ZEISS APO đạt chuẩn chứng nhận chuyên nghiệp, chip hình ảnh V3 độc quyền và vi xử lý Dimensity 9300 đỉnh cao.');
INSERT INTO product_images (product_id, position, url) VALUES (6, 0, '/images/4350531d6ae81fe8.webp');
INSERT INTO product_specifications (product_id, spec_name, spec_value) VALUES
(6, 'Chip xử lý', 'MediaTek Dimensity 9300'),
(6, 'RAM', '16 GB'),
(6, 'Màn hình', '6.78 inch AMOLED 8T LTPO, 3000 nits'),
(6, 'Camera', '3 camera ZEISS 50 MP (Cảm biến 1 inch Sony IMX989)'),
(6, 'Pin', '5.400 mAh, sạc 100W FlashCharge'),
(6, 'Hệ điều hành', 'Funtouch OS 14');
INSERT INTO product_variants (product_id, color, storage, price, active, color_hex, image) VALUES
(6, 'Đen', '256GB', 22990000, true, '#333638', '/images/4350531d6ae81fe8.webp'),
(6, 'Xanh Hoàng Hôn', '256GB', 22990000, true, '#2d5a7b', '/images/4350531d6ae81fe8.webp'),
(6, 'Đen', '512GB', 25990000, true, '#333638', '/images/4350531d6ae81fe8.webp');

ALTER TABLE products ALTER COLUMN id RESTART WITH 7;
ALTER TABLE product_variants ALTER COLUMN id RESTART WITH 25;
