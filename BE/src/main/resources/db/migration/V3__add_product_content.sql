ALTER TABLE products ADD COLUMN description TEXT NOT NULL DEFAULT '';
CREATE TABLE product_images (
    product_id BIGINT NOT NULL REFERENCES products(id),
    position INTEGER NOT NULL,
    url VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, position)
);
CREATE TABLE product_specifications (
    product_id BIGINT NOT NULL REFERENCES products(id),
    spec_name VARCHAR(255) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    PRIMARY KEY (product_id, spec_name)
);
