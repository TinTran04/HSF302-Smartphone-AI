package com.smartphoneai.service.support;

import java.util.List;

/**
 * Các nền tảng Chat AI mà Admin có thể cấu hình và hoán chuyển.
 * Embedding cho RAG vẫn dùng Gemini, chỉ phần sinh câu trả lời được đổi nền tảng.
 */
public final class AiProviders {
    public static final String GEMINI = "GEMINI";
    public static final String GROQ = "GROQ";
    public static final String DEEPSEEK = "DEEPSEEK";

    /** Dùng trong {@code @Pattern} của các DTO; phải khớp với {@link #CHAT}. */
    public static final String CHAT_PATTERN = "GEMINI|GROQ|DEEPSEEK";

    /** Thứ tự hiển thị trong trang cấu hình. */
    public static final List<String> CHAT = List.of(GEMINI, GROQ, DEEPSEEK);

    private AiProviders() {}

    public static boolean isChatProvider(String provider) {
        return provider != null && CHAT.contains(provider);
    }

    /** Base URL của API tương thích OpenAI; Spring AI tự nối thêm {@code /v1/chat/completions}. */
    public static String openAiCompatibleBaseUrl(String provider) {
        return switch (provider) {
            case GROQ -> "https://api.groq.com/openai";
            case DEEPSEEK -> "https://api.deepseek.com";
            default -> null;
        };
    }
}
