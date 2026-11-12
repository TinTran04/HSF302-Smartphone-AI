package com.smartphoneai.service;

import com.smartphoneai.dto.request.AiModelOptionsRequest;
import com.smartphoneai.dto.response.AiModelOptionsResponse;

public interface AiModelCatalogService {
    AiModelOptionsResponse options(AiModelOptionsRequest input);
}
