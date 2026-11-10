package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;

public record AiBackupKeyRequest(@Positive Long id, @NotBlank @Size(max = 80) String name,
                                 @Size(max = 2048) String apiKey) {}
