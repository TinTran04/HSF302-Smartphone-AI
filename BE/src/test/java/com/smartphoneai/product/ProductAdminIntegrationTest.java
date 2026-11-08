package com.smartphoneai.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import com.smartphoneai.support.JwtTestClient;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.Map;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productadmin;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.email=productadmin@example.com", "app.root-admin.password=TestRootPassword123!"})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class ProductAdminIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean OtpSender sender;
    @Test void adminCanCreateAndDeactivateProductWithVariant() throws Exception {
        var session = new JwtTestClient();
        mvc.perform(post("/api/auth/login").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"productadmin@example.com\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        var brand = mvc.perform(post("/api/admin/brands").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Example\"}")).andExpect(status().isCreated()).andReturn();
        String brandId = mapper.readTree(brand.getResponse().getContentAsString()).path("id").asText();
        var input = Map.of("name", "Example Phone", "brandId", brandId, "description", "Demo",
                "images", List.of("/images/demo.webp"), "specifications", Map.of("RAM", "8 GB"), "status", "ACTIVE",
                "variants", List.of(Map.of("color", "Black", "colorHex", "#000000", "storage", "256GB", "price", 12000000, "status", "ACTIVE")));
        var invalid = new java.util.HashMap<String, Object>(input);
        invalid.put("variants", List.of(Map.of("color", "Black", "storage", "256GB", "price", -1, "status", "ACTIVE")));
        mvc.perform(post("/api/admin/products").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(invalid))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        var duplicate = new java.util.HashMap<String, Object>(input);
        duplicate.put("variants", List.of(Map.of("color","Black","storage","256GB","price",1,"status","ACTIVE"),
                Map.of("color"," black ","storage","256GB","price",2,"status","ACTIVE")));
        mvc.perform(post("/api/admin/products").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(duplicate))).andExpect(status().isConflict());
        var created = mvc.perform(post("/api/admin/products").with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(input))).andExpect(status().isCreated())
                .andExpect(jsonPath("$.variants[0].price").value(12000000)).andReturn();
        String productId = mapper.readTree(created.getResponse().getContentAsString()).path("id").asText();
        String variantId = mapper.readTree(created.getResponse().getContentAsString()).path("variants").get(0).path("id").asText();
        mvc.perform(get("/api/products/" + productId)).andExpect(status().isOk()).andExpect(jsonPath("$.brandName").value("Example"));
        var updated = new java.util.HashMap<String, Object>(input);
        updated.put("variants", List.of(Map.of("id", variantId, "color", "Black", "colorHex", "#000000",
                "storage", "256GB", "price", 13000000, "status", "ACTIVE")));
        mvc.perform(put("/api/admin/products/" + productId).with(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))).andExpect(status().isOk())
                .andExpect(jsonPath("$.variants[0].price").value(13000000));
        mvc.perform(patch("/api/admin/products/" + productId + "/status").with(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"INACTIVE\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/products/" + productId)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"))
                .andExpect(jsonPath("$.variants[0].price").value(13000000));
        mvc.perform(get("/api/products").param("q", "Example Phone")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].status").value("INACTIVE"));
        mvc.perform(get("/api/admin/products/" + productId).with(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }
}
