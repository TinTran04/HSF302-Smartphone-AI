package com.smartphoneai.service;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.dto.response.PageResponse;
import java.util.Optional;

public interface ProductService {
    Optional<ProductResponse> findActive(Long id);

    PageResponse<ProductResponse> listActive(String query, int page, int size);

    PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                              String storage, int page, int size);

    PageResponse<ProductResponse> searchActive(String query, Long brandId, Long minPrice, Long maxPrice,
                                              String storage, String ram, String sort, int page, int size);
}
