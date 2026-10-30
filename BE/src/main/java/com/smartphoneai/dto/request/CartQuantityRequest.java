package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record CartQuantityRequest(@NotNull @Positive Integer quantity) {}
