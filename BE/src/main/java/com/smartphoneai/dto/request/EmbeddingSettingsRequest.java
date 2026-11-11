package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record EmbeddingSettingsRequest(@NotNull @Pattern(regexp="GEMINI") String provider,
        @Size(max=255) String model, @Size(max=2048) String apiKey,
        @Min(1) @Max(4096) Integer dimensions) {}
