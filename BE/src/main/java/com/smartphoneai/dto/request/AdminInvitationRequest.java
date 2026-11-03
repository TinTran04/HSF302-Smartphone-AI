package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;
public record AdminInvitationRequest(@NotBlank @Email @Size(max = 254) String email,
                                     @NotBlank @Size(max = 255) String fullName,
                                     @Pattern(regexp = "ADMIN") String role) {
    public AdminInvitationRequest(String email, String fullName) {
        this(email, fullName, "ADMIN");
    }
}
