package com.smartphoneai.cart;

import com.smartphoneai.entity.CartItem;
import com.smartphoneai.entity.ProductVariant;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;

class CartItemPriceTest {
    @Test void updatingQuantityRecordsTheCurrentPrice() {
        var variant = new ProductVariant();
        variant.setPrice(100);
        var item = new CartItem(UUID.randomUUID(), variant, 1);
        variant.setPrice(120);
        item.setQuantity(2);
        assertEquals(120, item.getPriceAtAdd());
    }
}
