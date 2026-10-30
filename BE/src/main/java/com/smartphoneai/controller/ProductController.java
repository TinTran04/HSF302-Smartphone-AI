package com.smartphoneai.controller;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.service.ProductService;
import com.smartphoneai.exception.ProductNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }
    @GetMapping
    public PageResponse<ProductResponse> list(@RequestParam(defaultValue = "") String q,
                                               @RequestParam(defaultValue = "1") int page,
                                               @RequestParam(defaultValue = "20") int size,
                                               @RequestParam(required = false) Long brandId,
                                               @RequestParam(required = false) Long minPrice,
                                               @RequestParam(required = false) Long maxPrice,
                                               @RequestParam(required = false) String storage,
                                               @RequestParam(required = false) String ram,
                                               @RequestParam(required = false) String sort) {
        if (brandId == null && minPrice == null && maxPrice == null && storage == null && ram == null && sort == null)
            return service.listActive(q, page, size);
        return service.searchActive(q, brandId, minPrice, maxPrice, storage, ram, sort, page, size);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.findActive(id).orElseThrow(ProductNotFoundException::new));
    }
}
