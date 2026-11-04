package com.smartphoneai.service;

import com.smartphoneai.dto.request.EmbeddingSettingsRequest;
import java.util.Map;

public interface EmbeddingSettingsService {
    public record Active(String id,String provider,String model,String key,int dimensions) {}

    Map<String, Object> describe();

    Map<String, Object> configure(EmbeddingSettingsRequest input);

    Active current();
}
