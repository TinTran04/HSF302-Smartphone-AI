package com.smartphoneai.service.impl;

import com.smartphoneai.entity.OrderRecord;
import com.smartphoneai.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class OrderChatLookup {
    private static final Pattern ID = Pattern.compile("(?i)\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b");
    private static final Pattern ORDER = Pattern.compile("(?iuU)đơn hàng|don hang|mã đơn|ma don|đơn của|don cua|theo dõi đơn|theo doi don");
    private final OrderRepository orders;
    public OrderChatLookup(OrderRepository orders) { this.orders = orders; }

    public boolean matches(String question, List<com.smartphoneai.dto.response.ChatMessageResponse> history) {
        if (ORDER.matcher(question).find()) return true;
        if (!ID.matcher(question).find()) return false;
        return history.stream().skip(Math.max(0, history.size()-4))
                .anyMatch(message -> ORDER.matcher(message.content()).find());
    }

    public String answer(UUID userId, String question) {
        var match = ID.matcher(question);
        if (match.find()) {
            return orders.findByIdAndUserId(UUID.fromString(match.group()), userId)
                    .map(this::describe).orElse("Không tìm thấy đơn hàng này trong tài khoản của bạn. Vui lòng kiểm tra lại mã đơn.");
        }
        var found = orders.findAllByUserIdOrderByCreatedAtDescIdDesc(userId);
        if (found.isEmpty()) return "Tài khoản của bạn chưa có đơn hàng nào.";
        if (found.size() == 1) return describe(found.getFirst());
        var choices = found.stream().limit(5).map(order -> "- " + order.getId() + ": " + status(order)).toList();
        return "Bạn có nhiều đơn hàng. Vui lòng chọn hoặc gửi mã đơn cần tra cứu:\n" + String.join("\n", choices)
                + (found.size() > 5 ? "\nBạn có thể xem thêm đơn hàng trong trang đơn hàng." : "");
    }
    private String describe(OrderRecord order) {
        return "Đơn hàng " + order.getId() + " hiện có trạng thái: " + status(order)
                + ". Hệ thống chưa cung cấp vị trí vận chuyển trực tiếp.";
    }
    private String status(OrderRecord order) {
        return switch (order.getStatus()) {
            case PENDING -> "Chờ xác nhận";
            case CONFIRMED -> "Đã xác nhận";
            case SHIPPING -> "Đang giao hàng";
            case COMPLETED -> "Hoàn thành";
            case CANCELLED -> "Đã hủy";
        };
    }
}
