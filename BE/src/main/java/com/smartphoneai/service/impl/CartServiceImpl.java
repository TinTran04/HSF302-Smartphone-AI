package com.smartphoneai.service.impl;

import com.smartphoneai.mapper.ProductMapper;

import com.smartphoneai.service.CartService;

import com.smartphoneai.dto.response.CartResponse;
import com.smartphoneai.dto.request.CartItemRequest;
import com.smartphoneai.entity.Cart;
import com.smartphoneai.entity.CartItem;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.CartActionException;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {
    private final CartRepository carts;
    private final CartItemRepository items;
    private final ProductVariantRepository variants;
    private final UserAccountRepository users;
    private final GuestCartMergeReceiptRepository mergeReceipts;
    public CartServiceImpl(CartRepository carts, CartItemRepository items, ProductVariantRepository variants,
                           UserAccountRepository users, GuestCartMergeReceiptRepository mergeReceipts) {
        this.carts = carts; this.items = items; this.variants = variants; this.users = users; this.mergeReceipts = mergeReceipts;
    }
    @Override
    @Transactional(readOnly = true)
    public CartResponse get(UUID userId) { return response(userId); }
    @Override
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
    @Override
    @Transactional
    public CartResponse add(UUID userId, Long variantId, int quantity) {
        lockUser(userId);
        var variant = variants.findLocked(variantId).orElseThrow(CartActionException::new);
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
    @Override
    @Transactional
    public CartResponse update(UUID userId, Long variantId, int quantity) {
        lockUser(userId);
        var variant = variants.findLocked(variantId).orElseThrow(CartActionException::new);
        var item = items.findByUserIdAndVariantId(userId, variantId).orElseThrow(CartActionException::new);
        if (!variant.isActive() || !variant.getProduct().isActive()) throw new CartActionException();
        item.setQuantity(quantity); items.flush(); return response(userId);
    }
    @Override
    @Transactional
    public CartResponse changeVariant(UUID userId, Long currentVariantId, Long targetVariantId) {
        lockUser(userId);
        if (currentVariantId.equals(targetVariantId)) return response(userId);

        long firstId = Math.min(currentVariantId, targetVariantId);
        long secondId = Math.max(currentVariantId, targetVariantId);
        var first = variants.findLocked(firstId).orElseThrow(CartActionException::new);
        var second = variants.findLocked(secondId).orElseThrow(CartActionException::new);
        var currentVariant = currentVariantId.equals(firstId) ? first : second;
        var targetVariant = targetVariantId.equals(firstId) ? first : second;
        var currentItem = items.findByUserIdAndVariantId(userId, currentVariantId).orElseThrow(CartActionException::new);

        if (!currentVariant.getProduct().getId().equals(targetVariant.getProduct().getId())
                || !targetVariant.isActive() || !targetVariant.getProduct().isActive())
            throw new CartActionException();

        var targetItem = items.findByUserIdAndVariantId(userId, targetVariantId).orElse(null);
        if (targetItem == null) {
            currentItem.changeVariant(targetVariant);
        } else {
            try { targetItem.setQuantity(Math.addExact(targetItem.getQuantity(), currentItem.getQuantity())); }
            catch (ArithmeticException ex) { throw new CartActionException(); }
            items.delete(currentItem);
        }
        items.flush();
        return response(userId);
    }
    @Override
    @Transactional
    public CartResponse remove(UUID userId, Long variantId) {
        lockUser(userId);
        var item = items.findByUserIdAndVariantId(userId, variantId).orElseThrow(CartActionException::new);
        items.delete(item); items.flush(); return response(userId);
    }
    @Override
    @Transactional
    public void merge(UUID userId, List<CartItemRequest> guestItems) {
        merge(userId, guestItems, null);
    }
    @Override
    @Transactional
    public void merge(UUID userId, List<CartItemRequest> guestItems, UUID mergeId) {
        boolean emptyCart = guestItems == null || guestItems.isEmpty();
        if (emptyCart && mergeId == null) return;
        lockUser(userId);
        if (mergeId != null) {
            String hash = payloadHash(guestItems);
            var receipt = mergeReceipts.findById(mergeId).orElse(null);
            if (receipt != null) {
                if (!receipt.matches(userId, hash)) throw new CartActionException();
                return;
            }
            try {
                mergeReceipts.insert(mergeId, userId, hash);
            } catch (DataIntegrityViolationException ex) {
                throw new CartActionException();
            }
        }
        if (emptyCart) return;
        if (!carts.existsById(userId)) carts.saveAndFlush(new Cart(userId));
        for (var entry : guestItems.stream().sorted(Comparator.comparing(CartItemRequest::variantId)).toList()) {
            var variant = variants.findLocked(entry.variantId()).orElse(null);
            if (variant == null) continue;
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
    private static String payloadHash(List<CartItemRequest> guestItems) {
        List<CartItemRequest> entries = guestItems == null ? List.of() : guestItems;
        String canonicalPayload = entries.stream()
                .sorted(Comparator.comparing(CartItemRequest::variantId).thenComparing(CartItemRequest::quantity))
                .map(entry -> entry.variantId() + "=" + entry.quantity())
                .collect(Collectors.joining(","));
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(canonicalPayload.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
    private void lockUser(UUID userId) {
        if (users.findLockedById(userId).filter(u -> u.isActive() && !u.isDisabled() && !u.isDeleted()).isEmpty())
            throw new InvalidCredentialsException();
    }
    private CartResponse response(UUID userId) {
        var values = items.findAllByUserId(userId).stream().map(CartServiceImpl::itemResponse).toList();
        long total = 0;
        try {
            for (var item : values) if (!item.unavailable()) total = Math.addExact(total, Math.multiplyExact(item.variant().price(), item.quantity()));
        } catch (ArithmeticException ex) { throw new CartActionException(); }
        return new CartResponse(values, total);
    }
    private static CartResponse.Item itemResponse(CartItem item) {
        try {
            ProductVariant v = item.getVariant();
            var product = ProductMapper.toResponse(v.getProduct());
            var variant = product.variants().stream().filter(entry -> entry.id().equals(v.getId().toString())).findFirst().orElseThrow(CartActionException::new);
            return new CartResponse.Item(v.getId().toString(), item.getQuantity(), product, variant,
                    item.getPriceAtAdd(), !v.isActive() || !v.getProduct().isActive());
        } catch (jakarta.persistence.EntityNotFoundException ex) { throw new CartActionException(); }
    }
}
