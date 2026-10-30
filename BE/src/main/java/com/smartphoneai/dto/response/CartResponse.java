package com.smartphoneai.dto.response;
import java.util.List;
public record CartResponse(List<Item> items, long total) {
    public record Item(String variantId, int quantity, ProductResponse product,
                       ProductResponse.VariantResponse variant, long priceAtAdd, boolean unavailable) {}
}
