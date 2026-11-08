package com.smartphoneai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

public record LoginRequest(@NotBlank @Size(max = 254) String identifier,
                           @NotBlank @Size(max = 72) String password,
                           @Size(max = 100) List<@Valid CartItemRequest> guestCart,
                           UUID guestCartMergeId) {
    public LoginRequest(String identifier, String password) {
        this(identifier, password, null, null);
    }
    public LoginRequest(String identifier, String password, List<CartItemRequest> guestCart) {
        this(identifier, password, guestCart, null);
    }
}
