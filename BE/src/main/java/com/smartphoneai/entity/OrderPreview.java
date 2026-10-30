package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name = "order_previews")
public class OrderPreview {
    @Id private UUID id;
    @Column(name="user_id", nullable=false) private UUID userId;
    @Column(name="full_name", nullable=false) private String fullName;
    @Column(nullable=false) private String phone;
    @Column(nullable=false) private String address;
    @Column(nullable=false) private String note;
    @Column(name="expires_at", nullable=false) private Instant expiresAt;
    @Column(nullable=false) private boolean used;
    @Version private long version;
    @OneToMany(mappedBy="preview", cascade=CascadeType.ALL) private List<OrderPreviewItem> items = new ArrayList<>();
    protected OrderPreview() {}
    public OrderPreview(UUID userId, String fullName, String phone, String address, String note, Instant expiresAt) {
        id=UUID.randomUUID(); this.userId=userId; this.fullName=fullName; this.phone=phone;
        this.address=address; this.note=note; this.expiresAt=expiresAt;
    }
    public void addItem(OrderPreviewItem item) { items.add(item); item.setPreview(this); }
    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getNote() { return note; }
    public Instant getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public void markUsed() { used = true; }
    public List<OrderPreviewItem> getItems() { return items; }
}
