package com.smartphoneai.service;

import com.smartphoneai.dto.response.BrandResponse;
import java.util.List;

public interface BrandService {
    List<BrandResponse> list();

    BrandResponse create(String name);

    BrandResponse update(Long id, String name);

    void delete(Long id);
}
