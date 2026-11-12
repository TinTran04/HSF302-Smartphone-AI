package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import java.util.List;
public record AiSettingsRequest(@NotNull @Pattern(regexp=com.smartphoneai.service.support.AiProviders.CHAT_PATTERN) String provider,
                                @NotBlank @Size(max=255) String model, @Size(max=2048) String apiKey,
                                @Size(max=2048) String backupApiKey, boolean removeBackupKey,
                                @Size(max=10) List<@NotNull @Valid AiBackupKeyRequest> backupKeys, @Positive Long configId) {
    public AiSettingsRequest(String provider, String model, String apiKey, String backupApiKey, boolean removeBackupKey) {
        this(provider, model, apiKey, backupApiKey, removeBackupKey, null, null);
    }
}
