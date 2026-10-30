package com.smartphoneai.controller;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.*;
import com.smartphoneai.service.AdminProductService;
import com.smartphoneai.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/admin")
public class AdminCatalogController {
    private final AdminProductService products;
    private final BrandService brands;
    public AdminCatalogController(AdminProductService products, BrandService brands) { this.products=products; this.brands=brands; }
    @GetMapping("/brands") public List<BrandResponse> brands() { return brands.list(); }
    @PostMapping("/brands") public ResponseEntity<BrandResponse> createBrand(@Valid @RequestBody BrandRequest input) {
        return ResponseEntity.status(201).body(brands.create(input.name()));
    }
    @PutMapping("/brands/{id}") public BrandResponse updateBrand(@PathVariable Long id, @Valid @RequestBody BrandRequest input) { return brands.update(id,input.name()); }
    @DeleteMapping("/brands/{id}") public ResponseEntity<Void> deleteBrand(@PathVariable Long id) { brands.delete(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/products") public PageResponse<ProductResponse> products(@RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="20") int size, @RequestParam(defaultValue="") String q,
            @RequestParam(required=false) String status) { return products.list(q,status,page,size); }
    @GetMapping("/products/{id}") public ProductResponse product(@PathVariable Long id) { return products.get(id); }
    @PostMapping("/products") public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductMutationRequest input) { return ResponseEntity.status(201).body(products.create(input)); }
    @PutMapping("/products/{id}") public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductMutationRequest input) { return products.update(id,input); }
    @PatchMapping("/products/{id}/status") public ProductResponse status(@PathVariable Long id, @Valid @RequestBody ProductStatusRequest input) { return products.status(id,input.status()); }
}
