package com.smartphoneai.service.impl;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.mapper.ProductMapper;
import com.smartphoneai.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductCatalogReader {
    private final ProductRepository products;
    public ProductCatalogReader(ProductRepository products) { this.products=products; }
    @Transactional(readOnly=true)
    public List<ProductResponse> read() {
        var result=new ArrayList<ProductResponse>();
        int page=0;
        org.springframework.data.domain.Page<com.smartphoneai.entity.Product> batch;
        do {
            batch=products.findByNameContainingIgnoreCase("",PageRequest.of(page++,100,Sort.by("id")));
            batch.getContent().stream().map(ProductMapper::toResponse).forEach(result::add);
        } while (batch.hasNext());
        return List.copyOf(result);
    }
}
