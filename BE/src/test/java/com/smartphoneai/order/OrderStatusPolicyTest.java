package com.smartphoneai.order;

import org.junit.jupiter.api.Test;
import com.smartphoneai.entity.OrderStatus;
import com.smartphoneai.service.OrderStatusPolicy;
import static org.junit.jupiter.api.Assertions.*;

class OrderStatusPolicyTest {
    @Test void customerMayCancelOnlyPendingOrders() {
        for (OrderStatus status : OrderStatus.values())
            assertEquals(status == OrderStatus.PENDING, OrderStatusPolicy.customerMayCancel(status));
    }

    @Test void adminMayAdvanceSequentiallyOrCancelBeforeShipping() {
        for (OrderStatus from : OrderStatus.values()) for (OrderStatus to : OrderStatus.values()) {
            boolean expected = (from == OrderStatus.PENDING && (to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED))
                    || (from == OrderStatus.CONFIRMED && (to == OrderStatus.SHIPPING || to == OrderStatus.CANCELLED))
                    || (from == OrderStatus.SHIPPING && to == OrderStatus.COMPLETED);
            assertEquals(expected, OrderStatusPolicy.adminMayTransition(from, to), from + " -> " + to);
        }
    }
}
