package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity @Table(name="order_preview_items")
public class OrderPreviewItem {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="preview_id") private OrderPreview preview;
    @Column(name="variant_id", nullable=false) private Long variantId;
    @Column(nullable=false) private int quantity;
    @Column(name="old_unit_price", nullable=false) private long oldUnitPrice;
    @Column(name="unit_price", nullable=false) private long unitPrice;
    protected OrderPreviewItem() {}
    public OrderPreviewItem(Long variantId, int quantity, long oldUnitPrice, long unitPrice) {
        id=UUID.randomUUID(); this.variantId=variantId; this.quantity=quantity; this.oldUnitPrice=oldUnitPrice; this.unitPrice=unitPrice;
    }
    public void setPreview(OrderPreview preview) { this.preview=preview; }
    public Long getVariantId() { return variantId; }
    public int getQuantity() { return quantity; }
    public long getOldUnitPrice() { return oldUnitPrice; }
    public long getUnitPrice() { return unitPrice; }
}
