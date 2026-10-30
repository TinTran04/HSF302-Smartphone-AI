package com.smartphoneai.product;

import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.Brand;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.ProductService;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {
    @Test void inactiveProductCannotBeViewedByCustomers() {
        var repository = mock(ProductRepository.class);
        var product = new Product();
        product.setId(1L);
        product.setName("Demo");
        product.setActive(false);
        when(repository.findByIdAndActiveTrue(1L)).thenReturn(Optional.empty());
        var service = new ProductService(repository);
        assertTrue(service.findActive(1L).isEmpty());
        verify(repository).findByIdAndActiveTrue(1L);
    }

    @Test void activeProductIsReturnedAsDto() {
        var repository = mock(ProductRepository.class);
        var product = new Product();
        product.setId(1L);
        product.setName("Demo");
        product.setActive(true);
        when(repository.findByIdAndActiveTrue(1L)).thenReturn(Optional.of(product));
        var result = new ProductService(repository).findActive(1L).orElseThrow();
        assertEquals("1", result.id());
        assertEquals("Demo", result.name());
    }

    @Test void productDetailContainsBrandAndVariantPrices() {
        var repository = mock(ProductRepository.class);
        var product = new Product();
        product.setId(7L);
        product.setName("Phone Demo");
        product.setActive(true);
        var brand = new Brand();
        brand.setId(2L);
        brand.setName("Demo Brand");
        product.setBrand(brand);
        var variant = new ProductVariant();
        variant.setId(9L);
        variant.setColor("Đen");
        variant.setStorage("256GB");
        variant.setPrice(12000000L);
        variant.setActive(true);
        product.addVariant(variant);
        when(repository.findByIdAndActiveTrue(7L)).thenReturn(Optional.of(product));
        var result = new ProductService(repository).findActive(7L).orElseThrow();
        assertEquals("Demo Brand", result.brandName());
        assertEquals("2", result.brandId());
        assertEquals("9", result.variants().getFirst().id());
        assertEquals(12000000L, result.variants().getFirst().price());
        assertEquals("256GB", result.variants().getFirst().storage());
    }
}
