package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "variant_id"}))
public class CartItem {
    @Id private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "variant_id") private ProductVariant variant;
    @Column(nullable = false) private int quantity;
    @Column(name = "price_at_add", nullable = false) private long priceAtAdd;
    @Version private long version;
    protected CartItem() {}
    public CartItem(UUID userId, ProductVariant variant, int quantity) {
        this.id = UUID.randomUUID(); this.userId = userId; this.variant = variant;
        this.quantity = quantity; this.priceAtAdd = variant.getPrice();
    }
    public ProductVariant getVariant() { return variant; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; this.priceAtAdd = variant.getPrice(); }
    public long getPriceAtAdd() { return priceAtAdd; }
}
