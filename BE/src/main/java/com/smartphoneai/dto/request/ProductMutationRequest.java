package com.smartphoneai.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.Map;
public record ProductMutationRequest(@NotBlank @Size(max=255) String name, @NotNull @Positive Long brandId,
        @NotNull @Size(max=20000) String description, @NotNull @Size(max=50) List<@NotBlank @Size(max=255) String> images,
        @NotNull @Size(max=100) Map<@NotBlank @Size(max=255) String, @NotNull @Size(max=255) String> specifications,
        @NotNull @Pattern(regexp="ACTIVE|INACTIVE") String status,
        @NotEmpty @Size(max=100) List<@Valid Variant> variants) {
    public record Variant(@Positive Long id, @NotBlank @Size(max=255) String color,
            @Size(max=255) String colorHex, @NotBlank @Size(max=255) String storage,
            @NotNull @PositiveOrZero Long price, @NotNull @Pattern(regexp="ACTIVE|INACTIVE") String status,
            @Size(max=255) String image) {}
}
