package com.smartphoneai.service.support;

public final class ChatTopics {
    private ChatTopics() {}

    public static String normalize(String topic) {
        return switch (topic) {
            case "PHONE_COMPARISON", "GENERAL_CHAT" -> "PHONE_CONSULTATION";
            default -> topic;
        };
    }

    public static String title(String topic) {
        return "SHOP_SUPPORT".equals(normalize(topic)) ? "Hỗ trợ cửa hàng" : "Tư vấn mua điện thoại";
    }
}
