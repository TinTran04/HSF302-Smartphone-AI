package com.smartphoneai.service;

import com.smartphoneai.dto.response.CartResponse;
import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.dto.request.CartItemRequest;
import com.smartphoneai.entity.Cart;
import com.smartphoneai.entity.CartItem;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.CartActionException;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {
    private final CartRepository carts;
    private final CartItemRepository items;
    private final ProductVariantRepository variants;
    private final UserAccountRepository users;
    public CartService(CartRepository carts, CartItemRepository items, ProductVariantRepository variants, UserAccountRepository users) {
        this.carts = carts; this.items = items; this.variants = variants; this.users = users;
    }
    @Transactional(readOnly = true)
    public CartResponse get(UUID userId) { return response(userId); }
    @Transactional(readOnly = true)
    public CartResponse resolve(List<CartItemRequest> requested) {
        var result = new java.util.ArrayList<CartResponse.Item>();
        long total = 0;
        try {
            for (var entry : requested) {
                var variant = variants.findById(entry.variantId()).orElse(null);
                if (variant == null) {
                    result.add(new CartResponse.Item(entry.variantId().toString(), entry.quantity(), null, null, 0, true));
                    continue;
                }
                var item = itemResponse(new CartItem(null, variant, entry.quantity()));
                result.add(item);
                if (!item.unavailable()) total = Math.addExact(total, Math.multiplyExact(variant.getPrice(), entry.quantity()));
            }
        } catch (ArithmeticException ex) { throw new CartActionException(); }
        return new CartResponse(List.copyOf(result), total);
    }
    @Transactional
    public CartResponse add(UUID userId, Long variantId, int quantity) {
        lockUser(userId);
        var variant = variants.findById(variantId).orElseThrow(CartActionException::new);
        if (!variant.isActive() || !variant.getProduct().isActive()) throw new CartActionException();
        if (!carts.existsById(userId)) carts.saveAndFlush(new Cart(userId));
        var item = items.findByUserIdAndVariantId(userId, variantId).orElse(null);
        if (item == null) items.save(new CartItem(userId, variant, quantity));
        else {
            try { item.setQuantity(Math.addExact(item.getQuantity(), quantity)); }
            catch (ArithmeticException ex) { throw new CartActionException(); }
        }
        items.flush();
        return response(userId);
    }
    @Transactional
    public CartResponse update(UUID userId, Long variantId, int quantity) {
        lockUser(userId);
        var item = items.findByUserIdAndVariantId(userId, variantId).orElseThrow(CartActionException::new);
        if (!item.getVariant().isActive() || !item.getVariant().getProduct().isActive()) throw new CartActionException();
        item.setQuantity(quantity); items.flush(); return response(userId);
    }
    @Transactional
    public CartResponse remove(UUID userId, Long variantId) {
        lockUser(userId);
        var item = items.findByUserIdAndVariantId(userId, variantId).orElseThrow(CartActionException::new);
        items.delete(item); items.flush(); return response(userId);
    }
    @Transactional
    public void merge(UUID userId, List<CartItemRequest> guestItems) {
        if (guestItems == null || guestItems.isEmpty()) return;
        lockUser(userId);
        if (!carts.existsById(userId)) carts.saveAndFlush(new Cart(userId));
        for (var entry : guestItems) {
            var variant = variants.findById(entry.variantId()).orElseThrow(CartActionException::new);
            var item = items.findByUserIdAndVariantId(userId, entry.variantId()).orElse(null);
            if (item == null) items.saveAndFlush(new CartItem(userId, variant, entry.quantity()));
            else {
                try { item.setQuantity(Math.addExact(item.getQuantity(), entry.quantity())); }
                catch (ArithmeticException ex) { throw new CartActionException(); }
            }
        }
        items.flush();
        response(userId);
    }
    private void lockUser(UUID userId) {
        if (users.findLockedById(userId).filter(u -> u.isActive()).isEmpty()) throw new InvalidCredentialsException();
    }
    private CartResponse response(UUID userId) {
        var values = items.findAllByUserId(userId).stream().map(CartService::itemResponse).toList();
        long total = 0;
        try {
            for (var item : values) if (!item.unavailable()) total = Math.addExact(total, Math.multiplyExact(item.variant().price(), item.quantity()));
        } catch (ArithmeticException ex) { throw new CartActionException(); }
        return new CartResponse(values, total);
    }
    private static CartResponse.Item itemResponse(CartItem item) {
        ProductVariant v = item.getVariant();
        var product = ProductService.toResponse(v.getProduct());
        var variant = product.variants().stream().filter(entry -> entry.id().equals(v.getId().toString())).findFirst().orElseThrow();
        return new CartResponse.Item(v.getId().toString(), item.getQuantity(), product, variant,
                item.getPriceAtAdd(), !v.isActive() || !v.getProduct().isActive());
    }
}
