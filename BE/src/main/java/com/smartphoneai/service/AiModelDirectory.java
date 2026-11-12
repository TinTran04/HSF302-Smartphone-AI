package com.smartphoneai.service;

import java.util.List;
import java.util.Optional;

/** Gọi API của nhà cung cấp để liệt kê model chat và đọc hạn mức của tài khoản. */
public interface AiModelDirectory {
    record ListedModel(String id, String displayName) {}
    record RateLimits(Long requestsPerDay, Long tokensPerMinute) {}

    List<ListedModel> listChatModels(String provider, String apiKey);

    /** Gửi một yêu cầu rất nhỏ để đọc hạn mức thật từ header; chỉ Groq trả các header này. */
    Optional<RateLimits> probeLimits(String provider, String model, String apiKey);
}
