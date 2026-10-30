package com.smartphoneai.service;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.exception.InvalidPaginationException;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import com.smartphoneai.entity.Product;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository products;
    public ProductService(ProductRepository products) { this.products = products; }
    @Transactional(readOnly = true)
    public Optional<ProductResponse> findActive(Long id) {
        return products.findByIdAndActiveTrue(id).map(ProductService::toResponse);
    }
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listActive(String query, int page, int size) {
        if (page < 1 || size < 1 || size > 100) throw new InvalidPaginationException();
        var found = products.findByActiveTrueAndNameContainingIgnoreCase(
                query == null ? "" : query.trim(), PageRequest.of(page - 1, size, Sort.by("id")));
        return new PageResponse<>(found.getContent().stream()
                .map(ProductService::toResponse).toList(),
                page, size, found.getTotalElements(), found.getTotalPages());
    }
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                                      String storage, int page, int size) {
        return searchActive(query, brandId, minPrice, maxPrice, storage, null, null, page, size);
    }
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                                      String storage, String ram, String sort, int page, int size) {
        if (page < 1 || size < 1 || size > 100 || (minPrice != null && minPrice < 0)
                || (maxPrice != null && maxPrice < 0)
                || (minPrice != null && maxPrice != null && minPrice > maxPrice)
                || (sort != null && !sort.isBlank() && !java.util.Set.of("price,asc", "price,desc", "name,asc", "name,desc").contains(sort)))
            throw new InvalidPaginationException();
        String normalizedStorage = storage == null || storage.isBlank() ? null : storage.trim();
        String normalizedRam = ram == null || ram.isBlank() ? null : ram.trim();
        var found = products.searchActive(query == null ? "" : query.trim(), brandId,
                minPrice != null || maxPrice != null || normalizedStorage != null,
                minPrice, maxPrice, normalizedStorage, normalizedRam, sort == null ? "" : sort,
                PageRequest.of(page - 1, size));
        return new PageResponse<>(found.getContent().stream().map(ProductService::toResponse).toList(),
                page, size, found.getTotalElements(), found.getTotalPages());
    }
    public static ProductResponse toResponse(Product p) {
        var brand = p.getBrand();
        return new ProductResponse(p.getId().toString(), p.getName(), brand == null ? null : brand.getId().toString(),
                brand == null ? null : brand.getName(), p.isActive() ? "ACTIVE" : "INACTIVE",
                p.getDescription(), java.util.List.copyOf(p.getImages()), java.util.Map.copyOf(p.getSpecifications()),
                p.getVariants().stream().map(v -> new ProductResponse.VariantResponse(v.getId().toString(), v.getColor(), v.getColorHex(),
                        v.getStorage(), v.getPrice(), v.isActive() ? "ACTIVE" : "INACTIVE", v.getImage())).toList());
    }
}
