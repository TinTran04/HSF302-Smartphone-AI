package com.smartphoneai.product;

import com.smartphoneai.controller.ProductController;
import com.smartphoneai.exception.GlobalExceptionHandler;
import com.smartphoneai.exception.InvalidPaginationException;
import com.smartphoneai.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductControllerTest {
    @Test void invalidPageReturnsValidationError() throws Exception {
        var service = mock(ProductService.class);
        when(service.listActive("", 0, 20)).thenThrow(new InvalidPaginationException());
        var mvc = MockMvcBuilders.standaloneSetup(new ProductController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(get("/api/products?page=0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
    @Test void missingProductReturnsStructuredError() throws Exception {
        var service = mock(ProductService.class);
        when(service.findActive(12L)).thenReturn(Optional.empty());
        var mvc = MockMvcBuilders.standaloneSetup(new ProductController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
        mvc.perform(get("/api/products/12"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }
}
