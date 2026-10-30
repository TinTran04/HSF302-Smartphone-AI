package com.smartphoneai.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
public record OrderPreviewRequest(@NotEmpty @Size(max=100) List<@NotNull @Positive Long> variantIds,
        @NotNull @Valid ShippingInfo shipping, @NotNull @Pattern(regexp="COD") String paymentMethod) {}
