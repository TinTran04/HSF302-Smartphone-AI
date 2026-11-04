package com.smartphoneai.service;

import com.smartphoneai.dto.request.ProductMutationRequest;
import com.smartphoneai.dto.response.PageResponse;
import com.smartphoneai.dto.response.ProductResponse;

public interface AdminProductService {
    PageResponse<ProductResponse> list(int page, int size);

    PageResponse<ProductResponse> list(String query, String status, int page, int size);

    ProductResponse get(Long id);

    ProductResponse create(ProductMutationRequest input);

    ProductResponse update(Long id, ProductMutationRequest input);

    ProductResponse status(Long id, String status);
}
