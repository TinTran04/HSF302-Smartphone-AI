package com.smartphoneai.controller;
import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.*;
import com.smartphoneai.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orders;
    public OrderController(OrderService orders) { this.orders=orders; }
    @PostMapping("/preview") public OrderPreviewResponse preview(Authentication auth, @Valid @RequestBody OrderPreviewRequest request) {
        return orders.preview(UUID.fromString(auth.getName()), request);
    }
    @PostMapping public ResponseEntity<OrderResponse> place(Authentication auth, @RequestHeader("Idempotency-Key") String key,
                                                            @Valid @RequestBody PlaceOrderRequest request) {
        return ResponseEntity.status(201).body(orders.place(UUID.fromString(auth.getName()), key, request));
    }
    @GetMapping public List<OrderResponse> list(Authentication auth) { return orders.list(UUID.fromString(auth.getName())); }
    @GetMapping("/{id}") public OrderResponse get(Authentication auth, @PathVariable UUID id) { return orders.get(UUID.fromString(auth.getName()), id); }
    @PostMapping("/{id}/cancel") public OrderResponse cancel(Authentication auth, @PathVariable UUID id) { return orders.cancel(UUID.fromString(auth.getName()), id); }
}
