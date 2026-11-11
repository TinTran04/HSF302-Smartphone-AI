package com.smartphoneai.service;

import com.smartphoneai.dto.response.ChatMessageResponse;
import java.util.List;

public interface TopicRouter {
    public record Decision(String result, String suggestedTopic, Boolean needsCatalog, Boolean needsDocuments) {
        public Decision(String result, String suggestedTopic) { this(result, suggestedTopic, null, null); }
    }

    Decision route(String currentTopic, String question, List<ChatMessageResponse> history);
}
