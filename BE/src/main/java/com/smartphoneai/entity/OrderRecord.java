package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name="orders", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","idempotency_key"}))
public class OrderRecord {
    @Id private UUID id;
    @Column(name="user_id", nullable=false) private UUID userId;
    @Column(name="preview_id", nullable=false) private UUID previewId;
    @Column(name="idempotency_key", nullable=false, length=128) private String idempotencyKey;
    @Column(name="full_name", nullable=false) private String fullName;
    @Column(nullable=false) private String phone;
    @Column(nullable=false) private String address;
    @Column(nullable=false) private String note;
    @Column(nullable=false) private long total;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private OrderStatus status;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Version private long version;
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL) private List<OrderLine> items = new ArrayList<>();
    @OneToMany(mappedBy="order", cascade=CascadeType.ALL) @OrderBy("changedAt ASC") private List<OrderStatusEntry> history = new ArrayList<>();
    protected OrderRecord() {}
    public OrderRecord(UUID userId, OrderPreview preview, String key, long total, Instant now) {
        id=UUID.randomUUID(); this.userId=userId; previewId=preview.getId(); idempotencyKey=key;
        fullName=preview.getFullName(); phone=preview.getPhone(); address=preview.getAddress(); note=preview.getNote();
        this.total=total; createdAt=now; transition(OrderStatus.PENDING, now);
    }
    public void addItem(OrderLine item) { items.add(item); item.setOrder(this); }
    public void transition(OrderStatus status, Instant now) { this.status=status; history.add(new OrderStatusEntry(this,status,now)); }
    public UUID getId() { return id; } public UUID getUserId() { return userId; }
    public UUID getPreviewId() { return previewId; } public String getFullName() { return fullName; }
    public String getPhone() { return phone; } public String getAddress() { return address; }
    public String getNote() { return note; } public long getTotal() { return total; }
    public OrderStatus getStatus() { return status; } public Instant getCreatedAt() { return createdAt; }
    public List<OrderLine> getItems() { return items; } public List<OrderStatusEntry> getHistory() { return history; }
}
