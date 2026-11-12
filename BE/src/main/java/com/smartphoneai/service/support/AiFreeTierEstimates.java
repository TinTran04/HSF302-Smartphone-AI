package com.smartphoneai.service.support;

import com.smartphoneai.service.AiModelDirectory.RateLimits;
import java.util.Locale;
import java.util.Optional;

/**
 * Ước tính hạn mức miễn phí của Gemini theo dòng model, vì Google không trả hạn mức qua API
 * và không công bố bảng theo từng model. Số liệu lấy theo bảng free tier công khai giữa năm 2025
 * (Flash-Lite 1.000, Flash 250, Pro 100 lượt/ngày; 250.000 token/phút). Hạn mức thật của từng
 * project xem trong Google AI Studio; sửa các con số ở đây khi Google thay đổi.
 */
public final class AiFreeTierEstimates {
    public static final String GEMINI_NOTE = "Gemini không trả hạn mức miễn phí qua API. Thứ tự dựa trên ước tính theo dòng model "
            + "(Flash-Lite > Flash > Pro); hạn mức thật của project xem trong Google AI Studio.";

    private AiFreeTierEstimates() {}

    public static Optional<RateLimits> gemini(String model) {
        String id = model.toLowerCase(Locale.ROOT);
        if (id.contains("flash-lite")) return Optional.of(new RateLimits(1_000L, 250_000L));
        if (id.contains("flash")) return Optional.of(new RateLimits(250L, 250_000L));
        if (id.contains("pro")) return Optional.of(new RateLimits(100L, 250_000L));
        return Optional.empty();
    }
}
