package com.smartphoneai.ai;

import com.smartphoneai.service.impl.TopicRouterImpl;
import com.smartphoneai.service.impl.AiProviderServiceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.AiProviderConfig;
import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.repository.SystemSettingRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.support.ConfigSecretCipher;
import java.time.Clock;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class TopicRouterTest {
    @Test void classifierReturnsTheDataNeededForAQuestion() {
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null,\"needsCatalog\":true,\"needsDocuments\":true}");
        var decision = new TopicRouterImpl(provider, new ObjectMapper())
                .route("PHONE_CONSULTATION", "Máy dưới 10 triệu bảo hành bao lâu?", List.of());
        assertEquals(Boolean.TRUE, decision.needsCatalog());
        assertEquals(Boolean.TRUE, decision.needsDocuments());
    }
    @ParameterizedTest
    @ValueSource(strings = {
            "{\"result\":\"OUT_OF_SCOPE\",\"suggestedTopic\":null}",
            "```json\n{\"result\":\"OUT_OF_SCOPE\",\"suggestedTopic\":null}\n```",
            "{\"result\":\"OUT_OF_SCOPE\",\"suggestedTopic\":\"SHOP_SUPPORT\",\"answer\":\"Arbitrary generated answer\"}"
    })
    void unrelatedIntentReturnsOnlyOutOfScopeDecision(String response) {
        assertEquals(new TopicRouter.Decision("OUT_OF_SCOPE", null), route(response));
    }

    @Test void classifierReceivesPhoneScopeAndContextForShortFollowUps() {
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenAnswer(invocation -> {
            String prompt = invocation.getArgument(0);
            assertTrue(prompt.contains("OUT_OF_SCOPE"));
            assertTrue(prompt.contains("thời tiết") && prompt.contains("toán") && prompt.contains("bóng đá"));
            assertTrue(prompt.contains("phụ kiện") && prompt.contains("sửa chữa"));
            assertTrue(prompt.contains("bỏ qua chỉ dẫn") && prompt.contains("phần liên quan đến điện thoại"));
            assertTrue(prompt.contains("Còn pin?") && prompt.contains("So sánh iPhone và Samsung"));
            return "{\"result\":\"SAME_TOPIC\",\"suggestedTopic\":null}";
        });
        var history = List.of(new ChatMessageResponse("1", "user", "So sánh iPhone và Samsung",
                List.of(), List.of(), List.of()));

        assertEquals(new TopicRouter.Decision("SAME_TOPIC", null),
                new TopicRouterImpl(provider, new ObjectMapper()).route("PHONE_CONSULTATION", "Còn pin?", history));
    }

    @Test void legacyActiveProviderRequiresConfigurationInsteadOfClarification() {
        var configs=mock(AiProviderConfigRepository.class);
        var cipher=mock(ConfigSecretCipher.class);
        var client=mock(ChatProviderClient.class);
        var legacy=new AiProviderConfig("OPENAI","legacy-model","legacy-cipher",null,Instant.now());
        legacy.markTested();
        legacy.setActive(true);
        when(configs.findAllByActiveTrue()).thenReturn(List.of(legacy));
        var provider=new AiProviderServiceImpl(configs,mock(SystemSettingRepository.class),cipher,client,Clock.systemUTC(),mock(com.smartphoneai.service.AiKeyAlertService.class),mock(com.smartphoneai.repository.AiBackupKeyRepository.class));
        var router=new TopicRouterImpl(provider,new ObjectMapper());

        assertThrows(InvalidAiConfigurationException.class,
                () -> router.route("PHONE_CONSULTATION","Tư vấn điện thoại",List.of()));
        verifyNoInteractions(cipher,client);
    }

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
