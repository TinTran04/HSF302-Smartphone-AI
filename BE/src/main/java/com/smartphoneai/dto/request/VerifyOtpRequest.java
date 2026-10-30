package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

public record VerifyOtpRequest(@NotNull UUID challengeId,
                               @NotBlank @Pattern(regexp = "[0-9]{6}") String code,
                               @Size(max = 100) List<@Valid CartItemRequest> guestCart) {}
