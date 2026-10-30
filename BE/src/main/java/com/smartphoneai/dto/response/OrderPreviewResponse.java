package com.smartphoneai.dto.response;
import java.util.List;
public record OrderPreviewResponse(String previewId, List<Item> items, long subtotal, long shippingFee, long total, boolean priceChanged) {
    public record Item(String variantId, int quantity, long oldUnitPrice, long currentUnitPrice, boolean priceChanged) {}
}
