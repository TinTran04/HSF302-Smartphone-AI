package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CartVariantChangeRequest(@NotNull @Positive Long variantId) {}
