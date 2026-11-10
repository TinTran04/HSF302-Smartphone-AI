package com.smartphoneai.dto.response;

import java.util.List;

public record AiNotificationsResponse(List<AiNotificationItemResponse> items, long unreadCount, String latestId) {}
