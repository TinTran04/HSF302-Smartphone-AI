package com.smartphoneai.controller;
import com.smartphoneai.dto.response.OrderResponse;
import com.smartphoneai.entity.OrderStatus;
import com.smartphoneai.service.OrderService;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/admin/orders")
public class AdminOrderController {
    public record StatusRequest(@NotNull OrderStatus status) {}
    private final OrderService orders;
    public AdminOrderController(OrderService orders) { this.orders=orders; }
    @GetMapping public List<OrderResponse> list() { return orders.listAdmin(); }
    @GetMapping("/{id}") public OrderResponse get(@PathVariable UUID id) { return orders.getAdmin(id); }
    @PatchMapping("/{id}/status") public OrderResponse change(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
        return orders.changeStatus(id, request.status());
    }
}
