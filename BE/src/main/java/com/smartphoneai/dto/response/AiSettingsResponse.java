package com.smartphoneai.dto.response;
import com.smartphoneai.entity.AiProviderConfig;
import java.util.List;
public record AiSettingsResponse(String provider, String model, String maskedKey, String maskedBackupKey,
                                 boolean active, boolean tested, String id, List<AiBackupKeyResponse> backupKeys) {
    public AiSettingsResponse(String provider, String model, String maskedKey, String maskedBackupKey, boolean active, boolean tested) {
        this(provider, model, maskedKey, maskedBackupKey, active, tested, null, List.of());
    }
    public static AiSettingsResponse from(AiProviderConfig config) {
        return new AiSettingsResponse(config.getProvider(), config.getModel(), config.hasKeys() ? "••••••••" : "",
                config.getBackupKeyCipher() == null ? "" : "••••••••", config.isActive(), config.isTested());
    }
}
