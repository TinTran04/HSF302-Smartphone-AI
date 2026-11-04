package com.smartphoneai.service;

import com.smartphoneai.dto.request.RegisterRequest;
import com.smartphoneai.dto.request.CartItemRequest;
import java.util.List;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.UserAccount;
import java.util.Optional;
import java.util.UUID;

public interface RegistrationService {
    public record Verified(UserAccount user, List<String> mergedConversationIds) {}

    OtpChallenge register(RegisterRequest input);

    Optional<Verified> verify(UUID challengeId, String code, List<CartItemRequest> guestCart, String guestToken);
}
