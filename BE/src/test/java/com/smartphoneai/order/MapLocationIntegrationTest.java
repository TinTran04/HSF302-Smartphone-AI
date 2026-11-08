package com.smartphoneai.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.support.JwtTestClient;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:maplocation;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=map-admin@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class MapLocationIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired ProductRepository products;
    @Autowired AuthTokenService tokens;
    @Autowired JdbcTemplate jdbc;

    @Test void profilePinIsPersistedReturnedAndClearedByFullSave() throws Exception {
        var user = customer();
        var session = JwtTestClient.authenticated(tokens, user);
        var profile = shipping();
        profile.set("location", mapper.valueToTree(Map.of("latitude", 10.7769, "longitude", 106.7009)));
        saveProfile(session, profile).andExpect(status().isOk())
                .andExpect(jsonPath("$.location.latitude").value(10.7769))
                .andExpect(jsonPath("$.location.longitude").value(106.7009));
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.location.latitude").value(10.7769));
        assertEquals(106.7009, jdbc.queryForObject("select longitude from users where id = ?", Double.class, user.getId()));

        profile.remove("location");
        saveProfile(session, profile).andExpect(status().isOk()).andExpect(jsonPath("$.location").doesNotExist());
        assertNull(jdbc.queryForObject("select latitude from users where id = ?", Double.class, user.getId()));
        profile.set("location", mapper.valueToTree(Map.of("latitude", -90, "longitude", 180)));
        saveProfile(session, profile).andExpect(status().isOk());
        profile.putNull("location");
        saveProfile(session, profile).andExpect(status().isOk()).andExpect(jsonPath("$.location").doesNotExist());
        mvc.perform(get("/api/users/me").with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.location").doesNotExist());
    }

    @Test void invalidPinsAreRejectedAtProfilePreviewAndPlacementBoundaries() throws Exception {
        var session = JwtTestClient.authenticated(tokens, customer());
        var variant = variantInCart(session);
        for (String invalid : List.of("{}", "{\"latitude\":10}", "{\"latitude\":null,\"longitude\":106}",
                "{\"latitude\":90.0001,\"longitude\":106}", "{\"latitude\":10,\"longitude\":-180.0001}",
                "{\"latitude\":\"NaN\",\"longitude\":106}", "{\"latitude\":10,\"longitude\":\"Infinity\"}")) {
            var shipping = shipping();
            shipping.set("location", mapper.readTree(invalid));
            saveProfile(session, shipping).andExpect(status().isBadRequest());
            preview(session, variant, shipping).andExpect(status().isBadRequest());
            place(session, UUID.randomUUID().toString(), "invalid-" + UUID.randomUUID(), shipping)
                    .andExpect(status().isBadRequest());
        }
        var shipping = shipping();
        shipping.put("address", " ");
        shipping.set("location", mapper.valueToTree(Map.of("latitude", 10, "longitude", 106)));
        preview(session, variant, shipping).andExpect(status().isBadRequest());
    }

    @Test void legacyProfileEditsPreservePinForSameAddressAndClearItWhenAddressChanges() throws Exception {
        var user = customer();
        var session = JwtTestClient.authenticated(tokens, user);
        var profile = shipping();
        profile.set("location", mapper.valueToTree(Map.of("latitude", 10, "longitude", 106)));
        saveProfile(session, profile).andExpect(status().isOk());
        user = users.findById(user.getId()).orElseThrow();
        user.updateProfile("New name", "0911111111", " 123 Nguyen Hue ");
        var unchangedAddress = mapper.valueToTree(UserResponse.from(user));
        assertEquals(10, unchangedAddress.path("location").path("latitude").asDouble());
        user.updateProfile("New name", "0911111111", "456 Road");
        assertTrue(mapper.valueToTree(UserResponse.from(user)).path("location").isNull());
    }

    @Test void checkoutPersistsPinSnapshotAndIdempotencyIncludesPin() throws Exception {
        var user = customer();
        var session = JwtTestClient.authenticated(tokens, user);
        var variant = variantInCart(session);
        var shipping = shipping();
        shipping.set("location", mapper.valueToTree(Map.of("latitude", 10.7769, "longitude", 106.7009)));
        String previewId = mapper.readTree(preview(session, variant, shipping).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("previewId").asText();
        var changedPin = shipping.deepCopy();
        changedPin.set("location", mapper.valueToTree(Map.of("latitude", 10.8, "longitude", 106.7)));
        place(session, previewId, "pin-mismatch", changedPin).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_ORDER"));
        var removedPin = shipping.deepCopy();
        removedPin.remove("location");
        place(session, previewId, "pin-removed", removedPin).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_ORDER"));

        var created = place(session, previewId, "pinned-checkout", shipping).andExpect(status().isCreated())
                .andExpect(jsonPath("$.shipping.location.latitude").value(10.7769))
                .andExpect(jsonPath("$.shipping.location.longitude").value(106.7009)).andReturn();
        String orderId = mapper.readTree(created.getResponse().getContentAsString()).path("id").asText();
        assertEquals(10.7769, jdbc.queryForObject("select latitude from order_previews where id = ?", Double.class, UUID.fromString(previewId)));
        assertEquals(106.7009, jdbc.queryForObject("select longitude from orders where id = ?", Double.class, UUID.fromString(orderId)));
        saveProfile(session, removedPin).andExpect(status().isOk());
        mvc.perform(get("/api/orders/" + orderId).with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.shipping.location.latitude").value(10.7769));
        place(session, previewId, "pinned-checkout", shipping).andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId));
        place(session, previewId, "pinned-checkout", changedPin).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"));
        place(session, previewId, "pinned-checkout", removedPin).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"));
    }

    @Test void legacyCheckoutAcceptsAbsentOrNullPinAndRejectsLaterPinAddition() throws Exception {
        var session = JwtTestClient.authenticated(tokens, customer());
        var variant = variantInCart(session);
        var shipping = shipping();
        String previewId = mapper.readTree(preview(session, variant, shipping).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).path("previewId").asText();
        shipping.putNull("location");
        var created = place(session, previewId, "legacy-checkout", shipping).andExpect(status().isCreated())
                .andExpect(jsonPath("$.shipping.location").doesNotExist()).andReturn();
        String orderId = mapper.readTree(created.getResponse().getContentAsString()).path("id").asText();
        shipping.remove("location");
        place(session, previewId, "legacy-checkout", shipping).andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId));
        shipping.set("location", mapper.valueToTree(Map.of("latitude", 10, "longitude", 106)));
        place(session, previewId, "legacy-checkout", shipping).andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("IDEMPOTENCY_KEY_REUSED"));
    }

    private UserAccount customer() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "An", "0900000000", "hash");
        user.activate();
        return users.saveAndFlush(user);
    }

    private long variantInCart(JwtTestClient session) throws Exception {
        var product = new Product();
        product.setName("Map phone");
        product.setActive(true);
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("128GB");
        variant.setPrice(10000000L);
        variant.setActive(true);
        product.addVariant(variant);
        products.saveAndFlush(product);
        mvc.perform(post("/api/cart/items").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantId", variant.getId().toString(), "quantity", 1))))
                .andExpect(status().isOk());
        return variant.getId();
    }

    private ObjectNode shipping() {
        return mapper.createObjectNode().put("fullName", "An").put("phone", "0900000000")
                .put("address", "123 Nguyen Hue").put("note", "");
    }

    private ResultActions saveProfile(JwtTestClient session, ObjectNode profile) throws Exception {
        return mvc.perform(put("/api/users/me").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(profile)));
    }

    private ResultActions preview(JwtTestClient session, long variantId, ObjectNode shipping) throws Exception {
        return mvc.perform(post("/api/orders/preview").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantIds", List.of(variantId), "shipping", shipping, "paymentMethod", "COD"))));
    }

    private ResultActions place(JwtTestClient session, String previewId, String key, ObjectNode shipping) throws Exception {
        return mvc.perform(post("/api/orders").with(session).with(csrf()).header("Idempotency-Key", key)
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("previewId", previewId, "shipping", shipping, "paymentMethod", "COD"))));
    }
}
