package com.smartphoneai.dto.response;
import com.smartphoneai.entity.AiProviderConfig;
public record AiSettingsResponse(String provider, String model, String maskedKey, boolean active, boolean tested) {
    public static AiSettingsResponse from(AiProviderConfig config) {
        return new AiSettingsResponse(config.getProvider(), config.getModel(), "••••••••", config.isActive(), config.isTested());
    }
}
