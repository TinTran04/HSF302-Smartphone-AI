package com.smartphoneai.service.impl;

import com.smartphoneai.mapper.ProductMapper;

import com.smartphoneai.service.ProductService;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.exception.InvalidPaginationException;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository products;
    public ProductServiceImpl(ProductRepository products) { this.products = products; }
    @Override
    @Transactional(readOnly = true)
    public Optional<ProductResponse> findActive(Long id) {
        return products.findById(id).map(ProductMapper::toResponse);
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> listActive(String query, int page, int size) {
        if (page < 1 || size < 1 || size > 100) throw new InvalidPaginationException();
        var found = products.findByNameContainingIgnoreCase(
                query == null ? "" : query.trim(), PageRequest.of(page - 1, size, Sort.by("id")));
        return new PageResponse<>(found.getContent().stream()
                .map(ProductMapper::toResponse).toList(),
                page, size, found.getTotalElements(), found.getTotalPages());
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                                      String storage, int page, int size) {
        return searchActive(query, brandId, minPrice, maxPrice, storage, null, null, page, size);
    }
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                                      String storage, String ram, String sort, int page, int size) {
        if (page < 1 || size < 1 || size > 100 || (minPrice != null && minPrice < 0)
                || (maxPrice != null && maxPrice < 0)
                || (minPrice != null && maxPrice != null && minPrice > maxPrice)
                || (sort != null && !sort.isBlank() && !java.util.Set.of("price,asc", "price,desc", "name,asc", "name,desc").contains(sort)))
            throw new InvalidPaginationException();
        String normalizedStorage = storage == null || storage.isBlank() ? null : storage.trim().toLowerCase();
        String normalizedRam = ram == null || ram.isBlank() ? null : ram.replaceAll("\\s+", "").toLowerCase();
        var found = products.searchActive(query == null ? "" : query.trim(), brandId,
                minPrice != null || maxPrice != null || normalizedStorage != null,
                minPrice, maxPrice, normalizedStorage, normalizedRam, sort == null ? "" : sort,
                PageRequest.of(page - 1, size));
        return new PageResponse<>(found.getContent().stream().map(ProductMapper::toResponse).toList(),
                page, size, found.getTotalElements(), found.getTotalPages());
    }
}
