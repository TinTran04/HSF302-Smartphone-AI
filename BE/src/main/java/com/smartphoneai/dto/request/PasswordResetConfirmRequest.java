package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record PasswordResetConfirmRequest(@NotNull UUID challengeId,
        @NotBlank @Size(max = 128) String resetToken,
        @NotBlank @Size(min = 8, max = 72) String newPassword) {}
