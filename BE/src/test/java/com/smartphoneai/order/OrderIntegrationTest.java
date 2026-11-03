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

    @Test void staffAndManagerOrderLifecycleWorkflow() throws Exception {
        var product = new Product(); product.setName("Galaxy AI"); product.setActive(true);
        var v = variant("Silver", 20000000L);
        product.addVariant(v); products.saveAndFlush(product);

        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());

        // 1. Register customer & staff users
        var custSession = new MockHttpSession();
        var custReg = mvc.perform(post("/api/auth/register").session(custSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"buyer@example.com\",\"password\":\"Password123!\",\"fullName\":\"Khach Hang\",\"phone\":\"0911222333\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String custChallenge = mapper.readTree(custReg.getResponse().getContentAsString()).path("challengeId").asText();
        var custLogin = mvc.perform(post("/api/auth/otp/verify").session(custSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", custChallenge, "code", code.get())))).andExpect(status().isOk()).andReturn();
        String custId = mapper.readTree(custLogin.getResponse().getContentAsString()).path("user").path("id").asText();

        var staffSession = new MockHttpSession();
        var staffReg = mvc.perform(post("/api/auth/register").session(staffSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"staff@example.com\",\"password\":\"Password123!\",\"fullName\":\"Nhan Vien\",\"phone\":\"0944555666\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String staffChallenge = mapper.readTree(staffReg.getResponse().getContentAsString()).path("challengeId").asText();
        var staffLogin = mvc.perform(post("/api/auth/otp/verify").session(staffSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", staffChallenge, "code", code.get())))).andExpect(status().isOk()).andReturn();
        String staffId = mapper.readTree(staffLogin.getResponse().getContentAsString()).path("user").path("id").asText();

        // Admin logs in and promotes staff@example.com to STAFF
        var rootSession = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(rootSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"orderadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        mvc.perform(patch("/api/admin/admins/" + staffId + "/role").session(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"STAFF\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("STAFF"));

        // Staff logs in with updated role
        var activeStaffSession = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(activeStaffSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"staff@example.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("STAFF"));

        // 2. Customer adds product to cart, previews, and places order
        mvc.perform(post("/api/cart/items").session(custSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantId", v.getId().toString(), "quantity", 1)))).andExpect(status().isOk());
        var shipping = Map.of("fullName", "Khach Hang", "phone", "0911222333", "address", "456 Le Loi", "note", "Giao gio hanh chinh");
        var preview = mvc.perform(post("/api/orders/preview").session(custSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("variantIds", List.of(v.getId().toString()), "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isOk()).andReturn();
        String previewId = mapper.readTree(preview.getResponse().getContentAsString()).path("previewId").asText();

        var place = mvc.perform(post("/api/orders").session(custSession).with(csrf()).header("Idempotency-Key", "staff-flow-order")
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("previewId", previewId, "shipping", shipping, "paymentMethod", "COD"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("PENDING")).andReturn();
        String orderId = mapper.readTree(place.getResponse().getContentAsString()).path("id").asText();

        // 3. Staff lists orders in /api/admin/orders, verifies status is PENDING
        mvc.perform(get("/api/admin/orders").session(activeStaffSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + orderId + "')].status").value("PENDING"));

        // 4. Staff approves order: PENDING -> CONFIRMED
        mvc.perform(patch("/api/admin/orders/" + orderId + "/status").session(activeStaffSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"CONFIRMED\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CONFIRMED"));

        // 5. Admin promotes staff to MANAGER to verify MANAGER can also manage orders
        mvc.perform(patch("/api/admin/admins/" + staffId + "/role").session(rootSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"role\":\"MANAGER\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.role").value("MANAGER"));

        var activeManagerSession = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(activeManagerSession).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"staff@example.com\",\"password\":\"Password123!\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("MANAGER"));

        // Manager transitions: CONFIRMED -> SHIPPING
        mvc.perform(patch("/api/admin/orders/" + orderId + "/status").session(activeManagerSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"SHIPPING\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("SHIPPING"));

        // Manager transitions: SHIPPING -> COMPLETED
        mvc.perform(patch("/api/admin/orders/" + orderId + "/status").session(activeManagerSession).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("COMPLETED"));

        // 6. Customer checks /api/orders and /api/orders/{id}
        mvc.perform(get("/api/orders").session(custSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + orderId + "')].status").value("COMPLETED"));

        var custOrder = mvc.perform(get("/api/orders/" + orderId).session(custSession)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.history.length()").value(4))
                .andExpect(jsonPath("$.history[0].status").value("PENDING"))
                .andExpect(jsonPath("$.history[1].status").value("CONFIRMED"))
                .andExpect(jsonPath("$.history[2].status").value("SHIPPING"))
                .andExpect(jsonPath("$.history[3].status").value("COMPLETED")).andReturn();

        // Customer cannot cancel an already completed order
        mvc.perform(post("/api/orders/" + orderId + "/cancel").session(custSession).with(csrf()))
                .andExpect(status().isConflict());
    }

    private ProductVariant variant(String color, long price) {
        var variant = new ProductVariant(); variant.setColor(color); variant.setStorage("256GB");
        variant.setPrice(price); variant.setActive(true); return variant;
    }
}
