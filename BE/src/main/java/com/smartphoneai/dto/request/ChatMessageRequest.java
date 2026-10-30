package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record ChatMessageRequest(@NotBlank @Size(max=5000) String content) {}
