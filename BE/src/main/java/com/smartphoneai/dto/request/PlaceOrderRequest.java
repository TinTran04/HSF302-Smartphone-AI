package com.smartphoneai.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record PlaceOrderRequest(@NotNull UUID previewId, @NotNull @Valid ShippingInfo shipping,
        @NotNull @Pattern(regexp="COD") String paymentMethod) {}
