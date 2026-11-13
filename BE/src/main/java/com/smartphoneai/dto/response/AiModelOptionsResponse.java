package com.smartphoneai.dto.response;
import java.time.Instant;
import java.util.List;
/**
 * Tối đa 3 model chat được đề xuất, xếp theo hạn mức dùng miễn phí giảm dần.
 * {@code source}: LIVE (đọc từ header của nhà cung cấp), ESTIMATE (bảng ước tính trong code),
 * NONE (nền tảng không có gói miễn phí).
 */
public record AiModelOptionsResponse(String provider, String source, String note, List<Option> models, Instant fetchedAt,
                                     List<String> savedModels) {
    public AiModelOptionsResponse(String provider, String source, String note, List<Option> models, Instant fetchedAt) {
        this(provider, source, note, models, fetchedAt, List.of());
    }
    public record Option(String id, String displayName, Long requestsPerDay, Long tokensPerMinute) {}
}
