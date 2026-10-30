package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record BrandRequest(@NotBlank @Size(max=255) String name) {}
