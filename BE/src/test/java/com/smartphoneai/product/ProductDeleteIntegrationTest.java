package com.smartphoneai.product;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.entity.*;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.*;
import com.smartphoneai.support.JwtTestClient;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productdelete;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class ProductDeleteIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ProductRepository products;
    @Autowired ProductVariantRepository variants;
    @Autowired UserAccountRepository users;
    @Autowired OrderPreviewRepository previews;
    @Autowired CartService cart;
    @Autowired OrderService orders;
    @Autowired AuthTokenService tokens;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactions;

    @Test void hardDeleteRemovesCatalogAndCartRowsInvalidatesWholePreviewAndPreservesOrderHistory() throws Exception {
        var user = user(); var product = product("Deleted Phone"); var other = product("Kept Phone");
        var variant = product.getVariants().getFirst(); var otherVariant = other.getVariants().getFirst();
        var shipping = new ShippingInfo("An", "0900000000", "123 Nguyen Hue", "");
        cart.add(user.getId(), variant.getId(), 1);
        var completedPreview = orders.preview(user.getId(), new OrderPreviewRequest(List.of(variant.getId()), shipping, "COD"));
        var placed = orders.place(user.getId(), "before-delete-" + UUID.randomUUID(),
                new PlaceOrderRequest(UUID.fromString(completedPreview.previewId()), shipping, "COD"));
        cart.add(user.getId(), variant.getId(), 2); cart.add(user.getId(), otherVariant.getId(), 1);
        var pending = orders.preview(user.getId(), new OrderPreviewRequest(List.of(variant.getId(), otherVariant.getId()), shipping, "COD"));
        var unaffected = orders.preview(user.getId(), new OrderPreviewRequest(List.of(otherVariant.getId()), shipping, "COD"));

        mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin()).with(csrf())).andExpect(status().isNoContent());

        assertFalse(products.existsById(product.getId())); assertFalse(variants.existsById(variant.getId()));
        assertEquals(0, jdbc.queryForObject("select count(*) from product_images where product_id=?", Integer.class, product.getId()));
        assertEquals(0, jdbc.queryForObject("select count(*) from product_specifications where product_id=?", Integer.class, product.getId()));
        assertEquals(0, jdbc.queryForObject("select count(*) from order_preview_items where variant_id=?", Integer.class, variant.getId()));
        assertEquals(1, cart.get(user.getId()).items().size());
        assertTrue(previews.findById(UUID.fromString(pending.previewId())).orElseThrow().isUsed());
        assertFalse(previews.findById(UUID.fromString(unaffected.previewId())).orElseThrow().isUsed());
        assertTrue(previews.existsById(UUID.fromString(completedPreview.previewId())));
        assertThrows(com.smartphoneai.exception.OrderConflictException.class, () -> orders.place(user.getId(), "partial-after-delete",
                new PlaceOrderRequest(UUID.fromString(pending.previewId()), shipping, "COD")));
        assertEquals("Deleted Phone", orders.get(user.getId(), UUID.fromString(placed.id())).items().getFirst().productName());
        mvc.perform(get("/api/products/" + product.getId())).andExpect(status().isNotFound());
        mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin()).with(csrf())).andExpect(status().isNotFound());
        mvc.perform(post("/api/cart/items").with(JwtTestClient.authenticated(tokens, user)).with(csrf())
                .contentType("application/json").content("{\"variantId\":\"" + variant.getId() + "\",\"quantity\":1}"))
                .andExpect(status().isConflict());
    }

    @Test void hardDeleteRequiresAdminAndCsrf() throws Exception {
        var product = product("Protected Phone");
        mvc.perform(delete("/api/admin/products/" + product.getId()).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/admin/products/" + product.getId()).with(JwtTestClient.authenticated(tokens, user())).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin())).andExpect(status().isForbidden());
        assertTrue(products.existsById(product.getId()));
    }

    @Test void busyCheckoutPreviewReturnsControlledConflictAndDeleteCanBeRetried() throws Exception {
        var user = user(); var product = product("Busy Phone");
        var variant = product.getVariants().getFirst();
        cart.add(user.getId(), variant.getId(), 1);
        var shipping = new ShippingInfo("An", "0900000000", "123 Nguyen Hue", "");
        var preview = orders.preview(user.getId(), new OrderPreviewRequest(List.of(variant.getId()), shipping, "COD"));
        var locked = new CountDownLatch(1); var release = new CountDownLatch(1);
        try (var executor = Executors.newSingleThreadExecutor()) {
            var holding = executor.submit(() -> new TransactionTemplate(transactions).executeWithoutResult(transaction -> {
                previews.findLocked(UUID.fromString(preview.previewId()), user.getId()).orElseThrow();
                locked.countDown();
                try { assertTrue(release.await(10, TimeUnit.SECONDS)); }
                catch (InterruptedException ex) { Thread.currentThread().interrupt(); throw new RuntimeException(ex); }
            }));
            assertTrue(locked.await(5, TimeUnit.SECONDS));
            try {
                mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin()).with(csrf()))
                        .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("CATALOG_CONFLICT"));
                assertTrue(products.existsById(product.getId()));
            } finally { release.countDown(); }
            holding.get(5, TimeUnit.SECONDS);
        }
        mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin()).with(csrf())).andExpect(status().isNoContent());
    }

    @Test void concurrentCartAddsAndDeletionNeverLeaveDanglingCartRowsOrServerErrors() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (int attempt = 0; attempt < 5; attempt++) {
                var product = product("Concurrent Phone"); var user = user();
                var variantId = product.getVariants().getFirst().getId();
                var admin = admin(); var customer = JwtTestClient.authenticated(tokens, user);
                var start = new CyclicBarrier(2);
                var deletion = executor.submit(() -> {
                    start.await(5, TimeUnit.SECONDS);
                    return mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin).with(csrf()))
                            .andReturn().getResponse().getStatus();
                });
                var addition = executor.submit(() -> {
                    start.await(5, TimeUnit.SECONDS);
                    return mvc.perform(post("/api/cart/items").with(customer).with(csrf()).contentType("application/json")
                            .content("{\"variantId\":\"" + variantId + "\",\"quantity\":1}"))
                            .andReturn().getResponse().getStatus();
                });
                int deleteStatus = deletion.get(10, TimeUnit.SECONDS), addStatus = addition.get(10, TimeUnit.SECONDS);
                assertTrue(deleteStatus == 204 || deleteStatus == 409, "delete status " + deleteStatus);
                assertTrue(addStatus == 200 || addStatus == 409, "cart status " + addStatus);
                if (deleteStatus == 409)
                    mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin).with(csrf())).andExpect(status().isNoContent());
                assertFalse(products.existsById(product.getId()));
                assertEquals(0, jdbc.queryForObject("select count(*) from cart_items where variant_id=?", Integer.class, variantId));
            }
        }
    }

    @Test void concurrentPreviewsAndDeletionCannotLeaveAConfirmablePartialPreview() throws Exception {
        try (var executor = Executors.newFixedThreadPool(2)) {
            for (int attempt = 0; attempt < 5; attempt++) {
                var product = product("Concurrent Preview Phone"); var user = user();
                var variantId = product.getVariants().getFirst().getId();
                cart.add(user.getId(), variantId, 1);
                var admin = admin(); var customer = JwtTestClient.authenticated(tokens, user);
                var start = new CyclicBarrier(2);
                var deletion = executor.submit(() -> {
                    start.await(5, TimeUnit.SECONDS);
                    return mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin).with(csrf()))
                            .andReturn().getResponse().getStatus();
                });
                var preview = executor.submit(() -> {
                    start.await(5, TimeUnit.SECONDS);
                    return mvc.perform(post("/api/orders/preview").with(customer).with(csrf()).contentType("application/json")
                            .content("{\"variantIds\":[\"" + variantId + "\"],\"shipping\":{\"fullName\":\"An\",\"phone\":\"0900000000\",\"address\":\"123 Nguyen Hue\",\"note\":\"\"},\"paymentMethod\":\"COD\"}"))
                            .andReturn().getResponse().getStatus();
                });
                int deleteStatus = deletion.get(10, TimeUnit.SECONDS), previewStatus = preview.get(10, TimeUnit.SECONDS);
                assertTrue(deleteStatus == 204 || deleteStatus == 409, "delete status " + deleteStatus);
                assertTrue(previewStatus == 200 || previewStatus == 409, "preview status " + previewStatus);
                if (deleteStatus == 409)
                    mvc.perform(delete("/api/admin/products/" + product.getId()).with(admin).with(csrf())).andExpect(status().isNoContent());
                assertFalse(products.existsById(product.getId()));
                assertEquals(0, jdbc.queryForObject("select count(*) from order_previews where user_id=? and used=false", Integer.class, user.getId()));
            }
        }
    }

    private UserAccount user() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "An", "0900000000", "hash"); user.activate();
        return users.saveAndFlush(user);
    }
    private JwtTestClient admin() {
        var admin = UserAccount.invitedAdmin(UUID.randomUUID() + "@example.com", "Admin"); admin.activate();
        return JwtTestClient.authenticated(tokens, users.saveAndFlush(admin));
    }
    private Product product(String name) {
        var product = new Product(); product.setName(name); product.setActive(true);
        product.getImages().add("/images/legacy.jpg"); product.getSpecifications().put("RAM", "8 GB");
        var variant = new ProductVariant(); variant.setColor("Black"); variant.setStorage("128GB"); variant.setPrice(10000000); variant.setActive(true);
        product.addVariant(variant); return products.saveAndFlush(product);
    }
}
