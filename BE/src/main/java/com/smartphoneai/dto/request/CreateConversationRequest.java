package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
import java.util.List;
public record CreateConversationRequest(@NotNull @Pattern(regexp="PHONE_CONSULTATION|PHONE_COMPARISON|SHOP_SUPPORT|GENERAL_CHAT") String topic,
        @Size(max=3) List<@NotBlank @Size(max=64) String> productIds) {}
