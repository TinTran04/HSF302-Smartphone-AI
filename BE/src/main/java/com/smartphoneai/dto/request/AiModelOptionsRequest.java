package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
/** {@code apiKey} để trống thì BE dùng key chính đã lưu của nền tảng. */
public record AiModelOptionsRequest(@NotNull @Pattern(regexp=com.smartphoneai.service.support.AiProviders.CHAT_PATTERN) String provider,
                                    @Size(max=2048) String apiKey) {}
