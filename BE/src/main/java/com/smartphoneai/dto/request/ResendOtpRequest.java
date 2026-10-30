package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ResendOtpRequest(@NotNull UUID challengeId) {}
