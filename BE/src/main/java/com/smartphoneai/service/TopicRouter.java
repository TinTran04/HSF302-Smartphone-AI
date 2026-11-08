package com.smartphoneai.service;

import com.smartphoneai.dto.response.ChatMessageResponse;
import java.util.List;

public interface TopicRouter {
    public record Decision(String result, String suggestedTopic) {}

    Decision route(String currentTopic, String question, List<ChatMessageResponse> history);
}
