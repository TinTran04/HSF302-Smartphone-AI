package com.smartphoneai.service.support;

public final class ChatTopics {
    public static final String PHONE_SCOPE_REMINDER = "Mình chỉ hỗ trợ tư vấn về điện thoại, như chọn mua, so sánh, cấu hình và cách sử dụng. Bạn muốn tìm hiểu điện thoại nào?";
    public static final String SHOP_SCOPE_REMINDER = "Mình chỉ hỗ trợ thông tin của cửa hàng, như chính sách, bảo hành, đổi trả và giao hàng. Bạn cần hỗ trợ nội dung nào?";

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
