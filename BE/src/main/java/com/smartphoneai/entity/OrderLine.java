package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="order_items")
public class OrderLine {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="order_id") private OrderRecord order;
    @Column(name="variant_id", nullable=false) private Long variantId;
    @Column(name="product_name", nullable=false) private String productName;
    @Column(nullable=false) private String color;
    @Column(nullable=false) private String storage;
    @Column(nullable=false) private int quantity;
    @Column(name="unit_price", nullable=false) private long unitPrice;
    protected OrderLine() {}
    public OrderLine(ProductVariant variant, int quantity) {
        id=UUID.randomUUID(); variantId=variant.getId(); productName=variant.getProduct().getName();
        color=variant.getColor(); storage=variant.getStorage(); this.quantity=quantity; unitPrice=variant.getPrice();
    }
    public void setOrder(OrderRecord order) { this.order=order; }
    public Long getVariantId() { return variantId; } public String getProductName() { return productName; }
    public String getColor() { return color; } public String getStorage() { return storage; }
    public int getQuantity() { return quantity; } public long getUnitPrice() { return unitPrice; }
}
