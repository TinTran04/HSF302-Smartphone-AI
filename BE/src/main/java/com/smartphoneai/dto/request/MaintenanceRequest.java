package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotNull;
public record MaintenanceRequest(@NotNull Boolean enabled) {}
