package com.smartphoneai.service;

import com.smartphoneai.dto.request.AiSettingsRequest;
import com.smartphoneai.dto.response.AiSettingsResponse;
import java.util.List;

public interface AiProviderService {
    List<AiSettingsResponse> list();

    AiSettingsResponse save(AiSettingsRequest input);

    void test(AiSettingsRequest input);
    void testBackupKey(Long configId, Long keyId);

    List<AiSettingsResponse> activate(String provider);
    List<AiSettingsResponse> activate(String provider, Long configId);

    String chat(String prompt);
}
