package com.smartphoneai.service;

import com.smartphoneai.dto.request.ProductMutationRequest;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.CatalogConflictException;
import com.smartphoneai.exception.InvalidPaginationException;
import com.smartphoneai.exception.ProductNotFoundException;
import com.smartphoneai.repository.BrandRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.ProductVariantRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;

@Service
public class AdminProductService {
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final BrandRepository brands;
    public AdminProductService(ProductRepository products, ProductVariantRepository variants, BrandRepository brands) {
        this.products=products; this.variants=variants; this.brands=brands;
    }
    @Transactional(readOnly=true)
    public PageResponse<ProductResponse> list(int page, int size) {
        return list("", null, page, size);
    }
    @Transactional(readOnly=true)
    public PageResponse<ProductResponse> list(String query, String status, int page, int size) {
        if (page < 1 || size < 1 || size > 100) throw new InvalidPaginationException();
        if (status != null && !status.isBlank() && !java.util.Set.of("ACTIVE", "INACTIVE").contains(status))
            throw new InvalidPaginationException();
        Boolean active = status == null || status.isBlank() ? null : "ACTIVE".equals(status);
        var found = products.searchAdmin(query == null ? "" : query.trim(), active, PageRequest.of(page-1, size, Sort.by("id")));
        return new PageResponse<>(found.getContent().stream().map(ProductService::toResponse).toList(),
                page, size, found.getTotalElements(), found.getTotalPages());
    }
    @Transactional(readOnly=true)
    public ProductResponse get(Long id) { return ProductService.toResponse(products.findById(id).orElseThrow(ProductNotFoundException::new)); }
    @Transactional
    public ProductResponse create(ProductMutationRequest input) {
        if (input.variants().stream().anyMatch(v -> v.id() != null)) throw new CatalogConflictException();
        var product = new Product();
        applyProduct(product, input);
        for (var data : input.variants()) { var variant = new ProductVariant(); applyVariant(variant, data); product.addVariant(variant); }
        products.saveAndFlush(product);
        return ProductService.toResponse(product);
    }
    @Transactional
    public ProductResponse update(Long id, ProductMutationRequest input) {
        var ids = input.variants().stream().map(ProductMutationRequest.Variant::id).filter(java.util.Objects::nonNull).toList();
        if (new HashSet<>(ids).size() != ids.size()) throw new CatalogConflictException();
        var locked = new java.util.HashMap<Long, ProductVariant>();
        for (Long variantId : ids.stream().sorted().toList()) {
            var variant = variants.findLocked(variantId).orElseThrow(CatalogConflictException::new);
            if (!variant.getProduct().getId().equals(id)) throw new CatalogConflictException();
            locked.put(variantId, variant);
        }
        var product = products.findLocked(id).orElseThrow(ProductNotFoundException::new);
        applyProduct(product, input);
        for (var data : input.variants()) {
            if (data.id() == null) { var variant = new ProductVariant(); applyVariant(variant, data); product.addVariant(variant); }
            else applyVariant(locked.get(data.id()), data);
        }
        products.flush();
        return ProductService.toResponse(product);
    }
    @Transactional
    public ProductResponse status(Long id, String status) {
        var product = products.findLocked(id).orElseThrow(ProductNotFoundException::new);
        product.setActive("ACTIVE".equals(status));
        return ProductService.toResponse(product);
    }
    private void applyProduct(Product product, ProductMutationRequest input) {
        product.setName(input.name().trim());
        product.setBrand(brands.findById(input.brandId()).orElseThrow(CatalogConflictException::new));
        product.setDescription(input.description());
        product.setActive("ACTIVE".equals(input.status()));
        product.getImages().clear(); product.getImages().addAll(input.images());
        product.getSpecifications().clear(); product.getSpecifications().putAll(input.specifications());
    }
    private static void applyVariant(ProductVariant variant, ProductMutationRequest.Variant data) {
        variant.setColor(data.color().trim()); variant.setColorHex(data.colorHex()); variant.setImage(data.image());
        variant.setStorage(data.storage().trim()); variant.setPrice(data.price()); variant.setActive("ACTIVE".equals(data.status()));
    }
}
