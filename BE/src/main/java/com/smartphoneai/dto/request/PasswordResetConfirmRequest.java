package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record PasswordResetConfirmRequest(@NotNull UUID challengeId,
        @NotBlank @Pattern(regexp = "[0-9]{6}") String code,
        @NotBlank @Size(min = 8, max = 72) String newPassword) {}
