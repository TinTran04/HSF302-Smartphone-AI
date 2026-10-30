package com.smartphoneai.cart;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:carttest;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class CartIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ProductRepository products;
    @MockitoBean OtpSender sender;

    @Test void guestCanResolveCartIncludingUnavailableVariants() throws Exception {
        var product = new Product(); product.setName("Unavailable"); product.setActive(false);
        var variant = new ProductVariant(); variant.setColor("Black"); variant.setStorage("128GB");
        variant.setPrice(8000000L); variant.setActive(true); product.addVariant(variant);
        products.saveAndFlush(product);
        mvc.perform(post("/api/cart/resolve").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("items", java.util.List.of(Map.of("variantId", variant.getId(), "quantity", 1))))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].unavailable").value(true))
                .andExpect(jsonPath("$.items[0].product.name").value("Unavailable"));
    }

    @Test void customerCartMergesQuantityAndRetainsUnavailableProducts() throws Exception {
        var product = new Product(); product.setName("Demo"); product.setActive(true);
        var variant = new ProductVariant(); variant.setColor("Black"); variant.setStorage("256GB");
        variant.setPrice(10000000L); variant.setActive(true); product.addVariant(variant);
        products.saveAndFlush(product);
        var variantId = variant.getId().toString();
        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var session = new MockHttpSession();
        var registration = mvc.perform(post("/api/auth/register").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"cart@example.com\",\"password\":\"Password123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String challengeId = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/otp/verify").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(Map.of("challengeId", challengeId, "code", code.get(),
                        "guestCart", java.util.List.of(Map.of("variantId", variantId, "quantity", 2))))))
                .andExpect(status().isOk());
        mvc.perform(get("/api/cart").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2));
        String item = mapper.writeValueAsString(Map.of("variantId", variantId, "quantity", 1));
        mvc.perform(post("/api/cart/items").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(item))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].quantity").value(3));
        mvc.perform(post("/api/cart/items").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(item))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].quantity").value(4));
        product.setActive(false); products.saveAndFlush(product);
        mvc.perform(get("/api/cart").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].unavailable").value(true));
        mvc.perform(delete("/api/cart/items/" + variantId).session(session).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(0));
    }
}
