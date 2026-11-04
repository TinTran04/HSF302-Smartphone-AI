package com.smartphoneai.mapper;

import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.entity.Product;

public final class ProductMapper {
    private ProductMapper() {}

    public static ProductResponse toResponse(Product p) {
        var brand = p.getBrand();
        return new ProductResponse(p.getId().toString(), p.getName(), brand == null ? null : brand.getId().toString(),
                brand == null ? null : brand.getName(), p.isActive() ? "ACTIVE" : "INACTIVE",
                p.getDescription(), java.util.List.copyOf(p.getImages()), java.util.Map.copyOf(p.getSpecifications()),
                p.getVariants().stream().map(v -> new ProductResponse.VariantResponse(v.getId().toString(), v.getColor(), v.getColorHex(),
                        v.getStorage(), v.getPrice(), v.isActive() ? "ACTIVE" : "INACTIVE", v.getImage())).toList());
    }
}
