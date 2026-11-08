package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangeAccountRoleRequest(@NotBlank @Pattern(regexp = "CUSTOMER|ADMIN") String role) {}
