package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotNull;

public record ChangeAccountStatusRequest(@NotNull Boolean enabled) {}
