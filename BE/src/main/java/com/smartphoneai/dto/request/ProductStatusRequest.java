package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record ProductStatusRequest(@NotNull @Pattern(regexp="ACTIVE|INACTIVE") String status) {}
