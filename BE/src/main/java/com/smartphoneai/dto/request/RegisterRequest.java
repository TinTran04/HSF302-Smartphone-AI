package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(@NotBlank @Email @Size(max = 254) String email,
                              @NotBlank @Size(min = 8, max = 72) String password,
                              @NotBlank @Size(max = 255) String fullName,
                              @NotBlank @Pattern(regexp = "[+0-9][0-9 -]{8,14}") String phone) {}
