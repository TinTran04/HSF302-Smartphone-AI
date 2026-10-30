package com.smartphoneai.dto.response;

import java.util.List;
import java.util.Map;

public record ProductResponse(String id, String name, String brandId, String brandName, String status,
                              String description, List<String> images, Map<String, String> specifications,
                              List<VariantResponse> variants) {
    public record VariantResponse(String id, String color, String colorHex, String storage, long price, String status, String image) {}
}
