package com.smartphoneai.product;

import com.smartphoneai.dto.request.OrderPreviewRequest;
import com.smartphoneai.dto.request.PlaceOrderRequest;
import com.smartphoneai.dto.request.ShippingInfo;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.CartActionException;
import com.smartphoneai.exception.OrderConflictException;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.OrderService;
import com.smartphoneai.service.ProductService;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productavailability;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@Transactional
class ProductAvailabilityIntegrationTest {
    @Autowired ProductRepository products;
    @Autowired UserAccountRepository users;
    @Autowired ProductService catalog;
    @Autowired CartService cart;
    @Autowired OrderService orders;

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void visibleUnavailableProductOrVariantCannotBeAddedUpdatedPreviewedOrOrdered(boolean productSoldOut) {
        var user = UserAccount.pendingCustomer("availability@example.com", "An", "0900000000", "hash");
        user.activate(); users.saveAndFlush(user);
        var product = new Product(); product.setName("Availability Phone"); product.setActive(true);
        var variant = new ProductVariant(); variant.setColor("Black"); variant.setStorage("128GB");
        variant.setPrice(10000000); variant.setActive(true);
        product.addVariant(variant); products.saveAndFlush(product);
        cart.add(user.getId(), variant.getId(), 1);
        var shipping = new ShippingInfo("An", "0900000000", "123 Nguyen Hue", "");
        var previewRequest = new OrderPreviewRequest(List.of(variant.getId()), shipping, "COD");
        var preview = orders.preview(user.getId(), previewRequest);

        if (productSoldOut) product.setActive(false);
        else variant.setActive(false);
        products.saveAndFlush(product);

        assertTrue(catalog.findActive(product.getId()).isPresent());
        assertEquals(productSoldOut ? "INACTIVE" : "ACTIVE", catalog.findActive(product.getId()).orElseThrow().status());
        assertTrue(cart.get(user.getId()).items().getFirst().unavailable());
        assertEquals(0, cart.get(user.getId()).total());
        assertThrows(CartActionException.class, () -> cart.add(user.getId(), variant.getId(), 1));
        assertThrows(CartActionException.class, () -> cart.update(user.getId(), variant.getId(), 2));
        assertEquals("PRODUCT_UNAVAILABLE", assertThrows(OrderConflictException.class,
                () -> orders.preview(user.getId(), previewRequest)).getCode());
        var placeRequest = new PlaceOrderRequest(UUID.fromString(preview.previewId()), shipping, "COD");
        assertEquals("PRICE_CHANGED", assertThrows(OrderConflictException.class,
                () -> orders.place(user.getId(), "availability-order", placeRequest)).getCode());
        assertEquals(1, cart.get(user.getId()).items().getFirst().quantity());
    }
}
