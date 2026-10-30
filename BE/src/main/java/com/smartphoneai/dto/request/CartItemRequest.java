package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record CartItemRequest(@NotNull @Positive Long variantId, @NotNull @Positive Integer quantity) {}
