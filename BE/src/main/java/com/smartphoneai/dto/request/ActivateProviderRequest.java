package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record ActivateProviderRequest(@NotNull @Pattern(regexp="OPENAI|GEMINI") String provider) {}
