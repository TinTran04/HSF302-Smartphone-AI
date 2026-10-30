package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;
public record UpdateProfileRequest(@NotBlank @Size(max = 255) String fullName,
        @NotBlank @Pattern(regexp = "[+0-9][0-9 -]{8,14}") String phone,
        @NotNull @Size(max = 255) String address) {}
