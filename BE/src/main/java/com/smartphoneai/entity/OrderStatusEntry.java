package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="order_status_history")
public class OrderStatusEntry {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="order_id") private OrderRecord order;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status;
    @Column(name="changed_at", nullable=false) private Instant changedAt;
    protected OrderStatusEntry() {}
    public OrderStatusEntry(OrderRecord order, OrderStatus status, Instant changedAt) {
        id=UUID.randomUUID(); this.order=order; this.status=status; this.changedAt=changedAt;
    }
    public OrderStatus getStatus() { return status; } public Instant getChangedAt() { return changedAt; }
}
