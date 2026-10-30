package com.smartphoneai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_variants")
public class ProductVariant {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id") private Product product;
    @Column(nullable = false) private String color;
    @Column(name = "color_hex") private String colorHex;
    private String image;
    @Column(nullable = false) private String storage;
    @Column(nullable = false) private long price;
    @Column(nullable = false) private boolean active;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public void setProduct(Product product) { this.product = product; }
    public Product getProduct() { return product; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getColorHex() { return colorHex; }
    public void setColorHex(String colorHex) { this.colorHex = colorHex; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }
    public long getPrice() { return price; }
    public void setPrice(long price) { this.price = price; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
