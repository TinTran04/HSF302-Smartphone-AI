package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record ActivateProviderRequest(@NotNull @Pattern(regexp=com.smartphoneai.service.support.AiProviders.CHAT_PATTERN) String provider, @Positive Long configId) {
    public ActivateProviderRequest(String provider) { this(provider, null); }
}
