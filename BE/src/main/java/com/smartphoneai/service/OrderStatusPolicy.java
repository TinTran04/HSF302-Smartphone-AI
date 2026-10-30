package com.smartphoneai.service;

import com.smartphoneai.entity.OrderStatus;

public final class OrderStatusPolicy {
    private OrderStatusPolicy() {}

    public static boolean customerMayCancel(OrderStatus status) {
        return status == OrderStatus.PENDING;
    }

    public static boolean adminMayTransition(OrderStatus from, OrderStatus to) {
        if (from == null || to == null) return false;
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.SHIPPING || to == OrderStatus.CANCELLED;
            case SHIPPING -> to == OrderStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
