package com.smartphoneai.controller;

import com.smartphoneai.dto.request.CartItemRequest;
import com.smartphoneai.dto.request.CartQuantityRequest;
import com.smartphoneai.dto.request.ResolveCartRequest;
import com.smartphoneai.dto.response.CartResponse;
import com.smartphoneai.service.CartService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService carts;
    public CartController(CartService carts) { this.carts = carts; }
    @GetMapping public CartResponse get(Authentication auth) { return carts.get(UUID.fromString(auth.getName())); }
    @PostMapping("/resolve") public CartResponse resolve(@Valid @RequestBody ResolveCartRequest input) {
        return carts.resolve(input.items());
    }
    @PostMapping("/items") public CartResponse add(Authentication auth, @Valid @RequestBody CartItemRequest input) {
        return carts.add(UUID.fromString(auth.getName()), input.variantId(), input.quantity());
    }
    @PatchMapping("/items/{id}") public CartResponse update(Authentication auth, @PathVariable Long id, @Valid @RequestBody CartQuantityRequest input) {
        return carts.update(UUID.fromString(auth.getName()), id, input.quantity());
    }
    @DeleteMapping("/items/{id}") public CartResponse remove(Authentication auth, @PathVariable Long id) {
        return carts.remove(UUID.fromString(auth.getName()), id);
    }
}
