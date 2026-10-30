package com.smartphoneai.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.ProductVariantRepository;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:ordertest;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=orderadmin", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
class OrderIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ProductRepository products;
    @Autowired ProductVariantRepository variants;
    @MockitoBean OtpSender sender;

    @Test void selectedCheckoutIsIdempotentAndDetectsPriceChanges() throws Exception {
        var product = new Product(); product.setName("Demo Phone"); product.setActive(true);
        var first = variant("Black", 10000000L); var second = variant("White", 11000000L);
        product.addVariant(first); product.addVariant(second); products.saveAndFlush(product);
        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var session = new MockHttpSession();
        var registration = mvc.perform(post("/api/auth/register").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"order@example.com\",\"password\":\"Password123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String challenge = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/otp/verify").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", challenge, "code", code.get())))).andExpect(status().isOk());
        for (var v : List.of(first, second)) mvc.perform(post("/api/cart/items").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantId", v.getId().toString(), "quantity", 1)))).andExpect(status().isOk());
        var shipping = Map.of("fullName", "An", "phone", "0900000000", "address", "123 Nguyen Hue", "note", "");
        var preview = mvc.perform(post("/api/orders/preview").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantIds", List.of(first.getId().toString()), "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.shippingFee").value(0)).andReturn();
        String previewId = mapper.readTree(preview.getResponse().getContentAsString()).path("previewId").asText();
        String orderBody = mapper.writeValueAsString(Map.of("previewId", previewId, "shipping", shipping, "paymentMethod", "COD"));
        var created = mvc.perform(post("/api/orders").session(session).with(csrf()).header("Idempotency-Key", "order-1")
                .contentType(MediaType.APPLICATION_JSON).content(orderBody)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.total").value(10000000)).andReturn();
        String orderId = mapper.readTree(created.getResponse().getContentAsString()).path("id").asText();
        mvc.perform(post("/api/orders").session(session).with(csrf()).header("Idempotency-Key", "order-1")
                .contentType(MediaType.APPLICATION_JSON).content(orderBody)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId));
        mvc.perform(get("/api/cart").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1)).andExpect(jsonPath("$.items[0].variantId").value(second.getId().toString()));
        var secondPreview = mvc.perform(post("/api/orders/preview").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantIds", List.of(second.getId().toString()), "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isOk()).andReturn();
        String secondPreviewId = mapper.readTree(secondPreview.getResponse().getContentAsString()).path("previewId").asText();
        var changed = variants.findById(second.getId()).orElseThrow(); changed.setPrice(12000000L); variants.saveAndFlush(changed);
        mvc.perform(post("/api/orders").session(session).with(csrf()).header("Idempotency-Key", "order-2")
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("previewId", secondPreviewId, "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("PRICE_CHANGED"));
        var changedPreview = mvc.perform(post("/api/orders/preview").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantIds", List.of(second.getId().toString()), "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.priceChanged").value(true))
                .andExpect(jsonPath("$.items[0].oldUnitPrice").value(11000000))
                .andExpect(jsonPath("$.items[0].currentUnitPrice").value(12000000)).andReturn();
        String changedPreviewId = mapper.readTree(changedPreview.getResponse().getContentAsString()).path("previewId").asText();
        var secondOrder = mvc.perform(post("/api/orders").session(session).with(csrf()).header("Idempotency-Key", "order-3")
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("previewId", changedPreviewId, "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(12000000)).andReturn();
        String secondOrderId = mapper.readTree(secondOrder.getResponse().getContentAsString()).path("id").asText();
        var admin = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(admin).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"orderadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        for (String status : List.of("CONFIRMED", "SHIPPING"))
            mvc.perform(patch("/api/admin/orders/" + secondOrderId + "/status").session(admin).with(csrf())
                    .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("status", status))))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.status").value(status));
        mvc.perform(post("/api/orders/" + secondOrderId + "/cancel").session(session).with(csrf()))
                .andExpect(status().isConflict()).andExpect(jsonPath("$.code").value("INVALID_ORDER_STATUS"));
        mvc.perform(patch("/api/admin/orders/" + secondOrderId + "/status").session(admin).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"));
        mvc.perform(post("/api/orders/" + orderId + "/cancel").session(session).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    private ProductVariant variant(String color, long price) {
        var variant = new ProductVariant(); variant.setColor(color); variant.setStorage("256GB");
        variant.setPrice(price); variant.setActive(true); return variant;
    }
}
