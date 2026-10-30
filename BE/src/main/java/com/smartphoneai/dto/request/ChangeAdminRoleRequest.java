package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotBlank;
public record ChangeAdminRoleRequest(@NotBlank String role) {}
