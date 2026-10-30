package com.smartphoneai.dto.response;
import com.smartphoneai.dto.request.ShippingInfo;
import com.smartphoneai.entity.OrderRecord;
import java.time.Instant;
import java.util.List;
public record OrderResponse(String id, String userId, String customerName, Instant createdAt, String status,
        List<Item> items, ShippingInfo shipping, long subtotal, long shippingFee, long total, String paymentMethod, List<History> history) {
    public record Item(String variantId, String productName, String color, String storage, int quantity, long unitPrice) {}
    public record History(String status, Instant at) {}
    public static OrderResponse from(OrderRecord order) {
        return new OrderResponse(order.getId().toString(), order.getUserId().toString(), order.getFullName(), order.getCreatedAt(),
                order.getStatus().name(), order.getItems().stream().map(i -> new Item(i.getVariantId().toString(), i.getProductName(),
                        i.getColor(), i.getStorage(), i.getQuantity(), i.getUnitPrice())).toList(),
                new ShippingInfo(order.getFullName(), order.getPhone(), order.getAddress(), order.getNote()),
                order.getTotal(), 0, order.getTotal(), "COD",
                order.getHistory().stream().map(h -> new History(h.getStatus().name(), h.getChangedAt())).toList());
    }
}
