package com.smartphoneai.service;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import java.util.List;

public interface AiProviderService {
    List<AiSettingsResponse> list();

    AiSettingsResponse save(AiSettingsRequest input);

    void test(AiSettingsRequest input);

    List<AiSettingsResponse> activate(String provider);

    String chat(String prompt);
}
