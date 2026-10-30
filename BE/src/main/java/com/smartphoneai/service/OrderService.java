package com.smartphoneai.service;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.*;
import com.smartphoneai.entity.*;
import com.smartphoneai.exception.*;
import com.smartphoneai.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.*;

@Service
public class OrderService {
    private final UserAccountRepository users;
    private final CartItemRepository cartItems;
    private final ProductVariantRepository variants;
    private final ProductRepository products;
    private final OrderPreviewRepository previews;
    private final OrderRepository orders;
    private final Clock clock;
    public OrderService(UserAccountRepository users, CartItemRepository cartItems, ProductVariantRepository variants,
            ProductRepository products, OrderPreviewRepository previews, OrderRepository orders, Clock clock) {
        this.users=users; this.cartItems=cartItems; this.variants=variants; this.products=products;
        this.previews=previews; this.orders=orders; this.clock=clock;
    }

    @Transactional
    public OrderPreviewResponse preview(UUID userId, OrderPreviewRequest request) {
        lockUser(userId);
        var ids = request.variantIds();
        if (new HashSet<>(ids).size() != ids.size()) throw new OrderConflictException("INVALID_ORDER");
        ShippingInfo shipping = request.shipping().normalized();
        var preview = new OrderPreview(userId, shipping.fullName(), shipping.phone(), shipping.address(), shipping.note(), clock.instant().plusSeconds(900));
        for (Long id : ids) {
            var cart = cartItems.findByUserIdAndVariantId(userId, id).orElseThrow(() -> new OrderConflictException("INVALID_ORDER"));
            var variant = cart.getVariant();
            if (!variant.isActive() || !variant.getProduct().isActive()) throw new OrderConflictException("PRODUCT_UNAVAILABLE");
            preview.addItem(new OrderPreviewItem(id, cart.getQuantity(), cart.getPriceAtAdd(), variant.getPrice()));
        }
        previews.save(preview);
        var responseItems = preview.getItems().stream().map(i -> new OrderPreviewResponse.Item(i.getVariantId().toString(),
                i.getQuantity(), i.getOldUnitPrice(), i.getUnitPrice(), i.getOldUnitPrice() != i.getUnitPrice())).toList();
        long total = total(preview.getItems());
        return new OrderPreviewResponse(preview.getId().toString(), responseItems, total, 0, total,
                responseItems.stream().anyMatch(OrderPreviewResponse.Item::priceChanged));
    }

    @Transactional
    public OrderResponse place(UUID userId, String idempotencyKey, PlaceOrderRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 128)
            throw new OrderConflictException("INVALID_IDEMPOTENCY_KEY");
        lockUser(userId);
        var existing = orders.findByUserIdAndIdempotencyKey(userId, idempotencyKey).orElse(null);
        if (existing != null) {
            if (!existing.getPreviewId().equals(request.previewId()) || !sameShipping(existing, request.shipping().normalized()))
                throw new OrderConflictException("IDEMPOTENCY_KEY_REUSED");
            return OrderResponse.from(existing);
        }
        var preview = previews.findLocked(request.previewId(), userId).orElseThrow(() -> new OrderConflictException("INVALID_ORDER"));
        if (preview.isUsed() || !clock.instant().isBefore(preview.getExpiresAt()) || !sameShipping(preview, request.shipping().normalized()))
            throw new OrderConflictException("INVALID_ORDER");
        var cartToDelete = new ArrayList<CartItem>();
        var lockedVariants = new ArrayList<ProductVariant>();
        var sortedItems = preview.getItems().stream().sorted(Comparator.comparing(OrderPreviewItem::getVariantId)).toList();
        for (var item : sortedItems) {
            var cart = cartItems.findByUserIdAndVariantId(userId, item.getVariantId()).orElseThrow(() -> new OrderConflictException("PRICE_CHANGED"));
            var variant = variants.findLocked(item.getVariantId()).orElseThrow(() -> new OrderConflictException("PRICE_CHANGED"));
            cartToDelete.add(cart); lockedVariants.add(variant);
        }
        var productStates = new HashMap<Long, Product>();
        for (Long productId : lockedVariants.stream().map(v -> v.getProduct().getId()).distinct().sorted().toList())
            productStates.put(productId, products.findLocked(productId).orElseThrow(() -> new OrderConflictException("PRICE_CHANGED")));
        for (int i=0; i<sortedItems.size(); i++) {
            var item = sortedItems.get(i);
            var variant = lockedVariants.get(i);
            if (!productStates.get(variant.getProduct().getId()).isActive() || !variant.isActive()
                    || variant.getPrice() != item.getUnitPrice() || cartToDelete.get(i).getQuantity() != item.getQuantity())
                throw new OrderConflictException("PRICE_CHANGED");
        }
        var order = new OrderRecord(userId, preview, idempotencyKey, total(preview.getItems()), clock.instant());
        for (int i=0; i<lockedVariants.size(); i++) order.addItem(new OrderLine(lockedVariants.get(i), cartToDelete.get(i).getQuantity()));
        orders.saveAndFlush(order);
        cartItems.deleteAll(cartToDelete);
        preview.markUsed();
        return OrderResponse.from(order);
    }

    @Transactional(readOnly=true)
    public List<OrderResponse> list(UUID userId) { return orders.findAllByUserIdOrderByCreatedAtDesc(userId).stream().map(OrderResponse::from).toList(); }
    @Transactional(readOnly=true)
    public OrderResponse get(UUID userId, UUID id) {
        return OrderResponse.from(orders.findByIdAndUserId(id, userId).orElseThrow(OrderNotFoundException::new));
    }
    @Transactional
    public OrderResponse cancel(UUID userId, UUID id) {
        var order = orders.findLocked(id).filter(o -> o.getUserId().equals(userId)).orElseThrow(OrderNotFoundException::new);
        if (!OrderStatusPolicy.customerMayCancel(order.getStatus())) throw new OrderConflictException("INVALID_ORDER_STATUS");
        order.transition(OrderStatus.CANCELLED, clock.instant()); return OrderResponse.from(order);
    }
    @Transactional(readOnly=true)
    public List<OrderResponse> listAdmin() { return orders.findAll().stream().map(OrderResponse::from).toList(); }
    @Transactional(readOnly=true)
    public OrderResponse getAdmin(UUID id) { return OrderResponse.from(orders.findById(id).orElseThrow(OrderNotFoundException::new)); }
    @Transactional
    public OrderResponse changeStatus(UUID id, OrderStatus status) {
        var order = orders.findLocked(id).orElseThrow(OrderNotFoundException::new);
        if (!OrderStatusPolicy.adminMayTransition(order.getStatus(), status)) throw new OrderConflictException("INVALID_ORDER_STATUS");
        order.transition(status, clock.instant()); return OrderResponse.from(order);
    }
    private void lockUser(UUID id) {
        if (users.findLockedById(id).filter(u -> u.isActive() && u.getRole() == UserAccount.Role.CUSTOMER).isEmpty())
            throw new InvalidCredentialsException();
    }
    private static long total(List<OrderPreviewItem> items) {
        long total=0;
        try { for (var item : items) total=Math.addExact(total, Math.multiplyExact(item.getUnitPrice(), item.getQuantity())); }
        catch (ArithmeticException ex) { throw new OrderConflictException("INVALID_ORDER"); }
        return total;
    }
    private static boolean sameShipping(OrderPreview p, ShippingInfo s) {
        return p.getFullName().equals(s.fullName()) && p.getPhone().equals(s.phone()) && p.getAddress().equals(s.address()) && p.getNote().equals(s.note());
    }
    private static boolean sameShipping(OrderRecord o, ShippingInfo s) {
        return o.getFullName().equals(s.fullName()) && o.getPhone().equals(s.phone()) && o.getAddress().equals(s.address()) && o.getNote().equals(s.note());
    }
}
