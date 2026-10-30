package com.smartphoneai.product;

import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productfilters;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class ProductFiltersIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ProductRepository products;

    @Test void filtersRamAndSortsByLowestActiveVariantPrice() throws Exception {
        save("Expensive", "8 GB", 200);
        save("Cheap", "8 GB", 100);
        save("Other RAM", "16 GB", 50);
        mvc.perform(get("/api/products").param("ram", "8 GB").param("sort", "price,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].name").value("Cheap"))
                .andExpect(jsonPath("$.items[1].name").value("Expensive"));
    }

    @Test @WithMockUser(roles = "ADMIN")
    void adminCanSearchByNameAndStatus() throws Exception {
        save("Search active", "8 GB", 100);
        var inactive = new Product(); inactive.setName("Search inactive"); inactive.setActive(false);
        products.saveAndFlush(inactive);
        mvc.perform(get("/api/admin/products").param("q", "search").param("status", "INACTIVE"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Search inactive"));
    }

    @Test void descendingPriceKeepsUnpricedProductsLast() throws Exception {
        var unpriced = new Product(); unpriced.setName("Unpriced-sort"); unpriced.setActive(true);
        products.saveAndFlush(unpriced);
        save("Priced-sort", "8 GB", 100);
        mvc.perform(get("/api/products").param("q", "-sort").param("sort", "price,desc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].name").value("Priced-sort"))
                .andExpect(jsonPath("$.items[1].name").value("Unpriced-sort"));
    }

    private void save(String name, String ram, long price) {
        var product = new Product();
        product.setName(name); product.setActive(true); product.getSpecifications().put("RAM", ram);
        var variant = new ProductVariant();
        variant.setColor("Black"); variant.setStorage("128GB"); variant.setPrice(price); variant.setActive(true);
        product.addVariant(variant); products.saveAndFlush(product);
    }
}
