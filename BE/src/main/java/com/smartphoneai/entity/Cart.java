package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "carts")
public class Cart {
    @Id @Column(name = "user_id") private UUID userId;
    protected Cart() {}
    public Cart(UUID userId) { this.userId = userId; }
}
