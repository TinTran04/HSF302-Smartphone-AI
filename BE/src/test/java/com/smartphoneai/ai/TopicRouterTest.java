package com.smartphoneai.ai;

import com.smartphoneai.service.impl.TopicRouterImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.TopicRouter;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class TopicRouterTest {
    @ParameterizedTest
    @ValueSource(strings = {"PHONE_COMPARISON", "GENERAL_CHAT"})
    void comparisonAndGeneralKnowledgeRemainInUnifiedConsultation(String legacyTopic) {
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"result\":\"DIFFERENT_TOPIC\",\"suggestedTopic\":\"" + legacyTopic + "\"}");
        var decision = new TopicRouterImpl(provider, new ObjectMapper()).route("PHONE_CONSULTATION", "So sánh và giải thích chip.", List.of());
        assertEquals(new TopicRouter.Decision("SAME_TOPIC", null), decision);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null}",
            "```json\n{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null}\n```",
            "  ```JSON\r\n{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null}\r\n```  ",
            "```\n{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null}\n```"
    })
    void sameTopicAcceptsPlainAndMarkdownJson(String response) {
        assertEquals(new TopicRouter.Decision("SAME_TOPIC", null), route(response));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "```json\n{\"result\":\"DIFFERENT_TOPIC\",\"suggestedTopic\":\"SHOP_SUPPORT\"}\n```",
            "{\"result\":\"DIFFERENT_TOPIC\",\"suggestedTopic\":\"SHOP_SUPPORT\"}"
    })
    void markdownJsonPreservesTopicSwitch(String response) {
        assertEquals(new TopicRouter.Decision("DIFFERENT_TOPIC", "SHOP_SUPPORT"), route(response));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Here is the result: ```json\n{\"result\":\"SAME_TOPIC\"}\n```",
            "{\"result\":\"SAME_TOPIC\"} {\"result\":\"UNCERTAIN\"}",
            "```json\n{broken}\n```",
            "null",
            "[]",
            "{\"result\":\"DIFFERENT_TOPIC\",\"suggestedTopic\":\"UNKNOWN\"}"
    })
    void invalidResponsesContinueToRequestClarification(String response) {
        assertEquals(new TopicRouter.Decision("UNCERTAIN", null), route(response));
    }

    private TopicRouter.Decision route(String response) {
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn(response);
        return new TopicRouterImpl(provider, new ObjectMapper()).route("GENERAL_CHAT", "2 + 2 bằng bao nhiêu?", List.of());
    }
}
