package com.smartphoneai.service;

import com.smartphoneai.dto.response.BrandResponse;
import com.smartphoneai.repository.BrandRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.entity.Brand;
import com.smartphoneai.exception.CatalogConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.List;

@Service
public class BrandService {
    private final BrandRepository repository;
    private final ProductRepository products;
    public BrandService(BrandRepository repository, ProductRepository products) { this.repository = repository; this.products = products; }
    public List<BrandResponse> list() {
        return repository.findAll(org.springframework.data.domain.Sort.by("name")).stream()
                .map(b -> new BrandResponse(b.getId().toString(), b.getName())).toList();
    }
    @Transactional
    public BrandResponse create(String name) {
        var brand = new Brand(); brand.setName(name.trim());
        try { repository.saveAndFlush(brand); }
        catch (DataIntegrityViolationException ex) { throw new CatalogConflictException(); }
        return new BrandResponse(brand.getId().toString(), brand.getName());
    }
    @Transactional
    public BrandResponse update(Long id, String name) {
        var brand = repository.findById(id).orElseThrow(CatalogConflictException::new);
        brand.setName(name.trim());
        try { repository.flush(); } catch (DataIntegrityViolationException ex) { throw new CatalogConflictException(); }
        return new BrandResponse(brand.getId().toString(), brand.getName());
    }
    @Transactional
    public void delete(Long id) {
        if (products.existsByBrandId(id)) throw new CatalogConflictException();
        var brand = repository.findById(id).orElseThrow(CatalogConflictException::new);
        repository.delete(brand);
    }
}
