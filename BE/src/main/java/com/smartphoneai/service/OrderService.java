package com.smartphoneai.service;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.*;
import com.smartphoneai.entity.*;
import java.util.*;

public interface OrderService {
    OrderPreviewResponse preview(UUID userId, OrderPreviewRequest request);

    OrderResponse place(UUID userId, String idempotencyKey, PlaceOrderRequest request);

    List<OrderResponse> list(UUID userId);

    OrderResponse get(UUID userId, UUID id);

    OrderResponse cancel(UUID userId, UUID id);

    List<OrderResponse> listAdmin();

    OrderResponse getAdmin(UUID id);

    OrderResponse changeStatus(UUID id, OrderStatus status);
}
