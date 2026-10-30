package com.smartphoneai.product;

import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.Brand;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.ProductService;
import com.smartphoneai.exception.InvalidPaginationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProductCatalogIntegrationTest {
    @Autowired ProductRepository repository;
    @Autowired TestEntityManager entityManager;

    @Test void savesAndReadsBrandAndVariants() {
        var brand = new Brand();
        brand.setName("Demo");
        entityManager.persist(brand);
        var product = new Product();
        product.setName("Phone");
        product.setActive(true);
        product.setBrand(brand);
        product.setDescription("Điện thoại demo");
        product.getImages().add("/images/demo.webp");
        product.getSpecifications().put("RAM", "8 GB");
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("256GB");
        variant.setPrice(12300000L);
        variant.setActive(true);
        product.addVariant(variant);
        repository.saveAndFlush(product);
        Long productId = product.getId();
        entityManager.clear();
        var response = new ProductService(repository).findActive(productId).orElseThrow();
        assertEquals("Demo", response.brandName());
        assertEquals(12300000L, response.variants().getFirst().price());
        assertEquals("Điện thoại demo", response.description());
        assertEquals("/images/demo.webp", response.images().getFirst());
        assertEquals("8 GB", response.specifications().get("RAM"));
    }

    @Test void publicCatalogReturnsOnlyActiveProductsMatchingSearch() {
        save("iPhone 15", true);
        save("iPhone 14", false);
        save("Samsung Galaxy", true);
        var result = new ProductService(repository).listActive("IPHONE", 1, 10);
        assertEquals(1, result.totalItems());
        assertEquals("iPhone 15", result.items().getFirst().name());
        assertEquals(1, result.page());
    }

    @Test void catalogUsesOneBasedPagesAndRejectsInvalidLimits() {
        save("First", true);
        save("Second", true);
        var service = new ProductService(repository);
        var result = service.listActive("", 2, 1);
        assertEquals(2, result.totalItems());
        assertEquals(2, result.totalPages());
        assertEquals("Second", result.items().getFirst().name());
        assertThrows(InvalidPaginationException.class, () -> service.listActive("", 0, 10));
        assertThrows(InvalidPaginationException.class, () -> service.listActive("", 1, 101));
    }

    @Test void catalogCanFilterByBrandAndVariantPriceAndStorage() {
        var brand = new Brand();
        brand.setName("Brand A");
        entityManager.persist(brand);
        var product = new Product();
        product.setName("Phone A");
        product.setActive(true);
        product.setBrand(brand);
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("256GB");
        variant.setPrice(12000000L);
        variant.setActive(true);
        product.addVariant(variant);
        repository.saveAndFlush(product);
        var service = new ProductService(repository);
        assertEquals(1, service.searchActive("", brand.getId(), 10000000L, 13000000L, "256GB", 1, 10).totalItems());
        assertEquals(0, service.searchActive("", brand.getId(), 10000000L, 11000000L, "256GB", 1, 10).totalItems());
        assertEquals(0, service.searchActive("", brand.getId(), null, null, "128GB", 1, 10).totalItems());
    }

    private void save(String name, boolean active) {
        Product product = new Product();
        product.setName(name);
        product.setActive(active);
        repository.saveAndFlush(product);
    }
}
