package com.smartphoneai.controller;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.*;
import com.smartphoneai.service.AdminProductService;
import com.smartphoneai.service.BrandService;
import com.smartphoneai.service.ProductImageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/admin")
public class AdminCatalogController {
    private final AdminProductService products;
    private final BrandService brands;
    private final ProductImageService images;
    public AdminCatalogController(AdminProductService products, BrandService brands, ProductImageService images) {
        this.products=products; this.brands=brands; this.images=images;
    }
    @GetMapping("/brands") public List<BrandResponse> brands() { return brands.list(); }
    @PostMapping("/brands") public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest input) {
        return ResponseEntity.status(201).body(brands.create(input.name()));
    }
    @PutMapping("/brands/{id}") public BrandResponse updateBrand(@PathVariable Long id, @Valid @RequestBody BrandRequest input) { return brands.update(id,input.name()); }
    @DeleteMapping("/brands/{id}") public ResponseEntity<Void> deleteBrand(@PathVariable Long id) { brands.delete(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/products") public PageResponse<ProductResponse> products(@RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="20") int size,
            @RequestParam(defaultValue="") String q,
            @RequestParam(required=false) String keyword,
            @RequestParam(required=false) String status) {
        String searchTerm = (q != null && !q.isBlank()) ? q : (keyword != null ? keyword : "");
        return products.list(searchTerm,status,page,size);
    }
    @GetMapping("/products/{id}") public ProductResponse product(@PathVariable Long id) { return products.get(id); }
    @PostMapping("/products") public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductMutationRequest input) { return ResponseEntity.status(201).body(products.create(input)); }
    @PostMapping(value="/products/images", consumes="multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(201).body(Map.of("url", images.upload(file)));
    }
    @DeleteMapping("/products/{id}") public ResponseEntity<Void> delete(@PathVariable Long id) { products.delete(id); return ResponseEntity.noContent().build(); }
    @PutMapping("/products/{id}") public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductMutationRequest input) { return products.update(id,input); }
    @PatchMapping("/products/{id}/status") public ProductResponse status(@PathVariable Long id, @Valid @RequestBody ProductStatusRequest input) { return products.status(id,input.status()); }
}
