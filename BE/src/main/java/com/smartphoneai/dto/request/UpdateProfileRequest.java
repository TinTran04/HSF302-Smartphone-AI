package com.smartphoneai.dto.request;

import com.smartphoneai.dto.GeoLocation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
public record UpdateProfileRequest(@NotBlank @Size(max = 255) String fullName,
        @NotNull @Pattern(regexp = "(?:|[+0-9][0-9 -]{8,14})") String phone,
        @NotNull @Size(max = 255) String address, @Valid GeoLocation location) {
    public UpdateProfileRequest(String fullName, String phone, String address) {
        this(fullName, phone, address, null);
    }
}
