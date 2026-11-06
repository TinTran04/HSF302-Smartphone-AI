package com.smartphoneai.product;

import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productfilters;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@Transactional
class ProductFiltersIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ProductRepository products;
    @Autowired com.smartphoneai.repository.BrandRepository brands;

    @Test void filtersRamAndSortsByLowestActiveVariantPrice() throws Exception {
        save("Expensive", "8 GB", 200);
        save("Cheap", "8 GB", 100);
        save("Other RAM", "16 GB", 50);
        mvc.perform(get("/api/products").param("ram", "8 GB").param("sort", "price,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[0].name").value("Cheap"))
                .andExpect(jsonPath("$.items[1].name").value("Expensive"));
    }

    @Test void filtersByBrandIdWithNullRamAndStorage() throws Exception {
        var apple = new com.smartphoneai.entity.Brand();
        apple.setName("AppleBrandTest");
        brands.saveAndFlush(apple);
        var p = new Product();
        p.setName("iPhone 16 BrandTest"); p.setActive(true); p.setBrand(apple);
        products.saveAndFlush(p);

        mvc.perform(get("/api/products").param("brandId", apple.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("iPhone 16 BrandTest"));
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

    @Test void priceAndStorageFiltersIncludeSoldOutProductsAndUseLastKnownVariants() throws Exception {
        var soldOut = save("Availability sold out", "8 GB", 150);
        soldOut.setActive(false);
        products.saveAndFlush(soldOut);
        var variantsSoldOut = save("Availability variants sold out", "8 GB", 100);
        variantsSoldOut.getVariants().getFirst().setActive(false);
        products.saveAndFlush(variantsSoldOut);
        save("Availability available", "8 GB", 200);

        mvc.perform(get("/api/products").param("q", "Availability").param("ram", "8GB")
                        .param("storage", "128GB").param("minPrice", "90").param("maxPrice", "210")
                        .param("sort", "price,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(3))
                .andExpect(jsonPath("$.items[0].name").value("Availability variants sold out"))
                .andExpect(jsonPath("$.items[0].variants[0].status").value("INACTIVE"))
                .andExpect(jsonPath("$.items[1].status").value("INACTIVE"))
                .andExpect(jsonPath("$.items[2].name").value("Availability available"));
        mvc.perform(get("/api/products").param("q", "Availability").param("sort", "price,desc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].name").value("Availability available"))
                .andExpect(jsonPath("$.items[1].name").value("Availability sold out"))
                .andExpect(jsonPath("$.items[2].name").value("Availability variants sold out"));
    }

    @Test void availableVariantPricesTakePrecedenceOverInactiveVariantPrices() throws Exception {
        var product = save("Mixed availability", "8 GB", 200);
        var inactive = new ProductVariant();
        inactive.setColor("White"); inactive.setStorage("256GB"); inactive.setPrice(50); inactive.setActive(false);
        product.addVariant(inactive); products.saveAndFlush(product);
        save("Mixed comparison", "8 GB", 100);

        mvc.perform(get("/api/products").param("q", "Mixed").param("sort", "price,asc"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items[0].name").value("Mixed comparison"));
        mvc.perform(get("/api/products").param("q", "Mixed availability").param("maxPrice", "100"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(0));
        mvc.perform(get("/api/products").param("q", "Mixed availability").param("storage", "256GB"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.totalItems").value(0));
    }

    private Product save(String name, String ram, long price) {
        var product = new Product();
        product.setName(name); product.setActive(true); product.getSpecifications().put("RAM", ram);
        var variant = new ProductVariant();
        variant.setColor("Black"); variant.setStorage("128GB"); variant.setPrice(price); variant.setActive(true);
        product.addVariant(variant); return products.saveAndFlush(product);
    }
}
