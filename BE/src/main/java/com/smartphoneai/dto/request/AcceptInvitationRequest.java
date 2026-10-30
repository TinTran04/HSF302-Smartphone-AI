package com.smartphoneai.dto.request;

import jakarta.validation.constraints.*;
public record AcceptInvitationRequest(@NotBlank @Size(max = 256) String token,
                                      @NotBlank @Size(min = 8, max = 72) String password) {}
