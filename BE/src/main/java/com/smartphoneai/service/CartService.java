package com.smartphoneai.service;

import com.smartphoneai.dto.response.CartResponse;
import com.smartphoneai.dto.request.CartItemRequest;
import java.util.List;
import java.util.UUID;

public interface CartService {
    CartResponse get(UUID userId);

    CartResponse resolve(List<CartItemRequest> requested);

    CartResponse add(UUID userId, Long variantId, int quantity);

    CartResponse update(UUID userId, Long variantId, int quantity);

    CartResponse remove(UUID userId, Long variantId);

    void merge(UUID userId, List<CartItemRequest> guestItems);
}
