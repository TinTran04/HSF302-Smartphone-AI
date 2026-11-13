package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.RagService;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.impl.PhoneAssistanceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.Page;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PhoneDataSelectionTest {
    @Test void productAdviceStillReadsCatalogWhenTheQuestionAlsoRequestsAnExplanation() {
        var products = mock(ProductRepository.class);
        when(products.findByNameContainingIgnoreCase(anyString(), any())).thenReturn(Page.empty());
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Shop chưa có máy phù hợp.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag).advise(
                "Giải thích máy nào RAM 8GB đáng mua?", List.of(), List.of(),
                new TopicRouter.Decision("SAME_TOPIC", null, true, false));
        verify(products).findByNameContainingIgnoreCase(anyString(), any());
        verifyNoInteractions(rag);
    }

    @ParameterizedTest
    @ValueSource(strings = {"RAM điện thoại là gì?", "Giải thích RAM trên điện thoại"})
    void generalPhoneKnowledgeCallsConfiguredAiWithoutCatalogOrDocumentRetrieval(String question) {
        var products = mock(ProductRepository.class);
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"RAM là bộ nhớ tạm.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var answer = new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag).advise(question, List.of(), List.of());
        org.junit.jupiter.api.Assertions.assertEquals("RAM là bộ nhớ tạm.", answer.text());
        verify(rag, never()).retrieve(anyString(), anyList());
        verifyNoInteractions(products);
        verify(ai).chat(argThat(prompt -> prompt.contains("kiến thức có sẵn chỉ trong phạm vi điện thoại")
                && prompt.contains("thời tiết") && prompt.contains("ngoài phạm vi")
                && prompt.contains("Không dùng kiến thức AI để bổ sung giá, tồn kho, thông số")));
    }

    @Test void batteryCapacityIsNotTreatedAsBudget() {
        var products = mock(ProductRepository.class);
        var phone = new com.smartphoneai.entity.Product();
        phone.setName("Battery Phone");
        phone.setId(1L);
        when(products.findByNameContainingIgnoreCase(anyString(), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(phone)));
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Cho mình thêm nhu cầu nhé.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag).advise("Tìm điện thoại pin 5.000 mAh", List.of(), List.of());
        verify(ai).chat(argThat(prompt -> prompt.contains("Ngân sách mua máy VND JSON: null")));
    }

    @Test void routerCanRequestDocumentsAndCatalogTogether() {
        var products = mock(ProductRepository.class);
        when(products.findByNameContainingIgnoreCase(anyString(), any())).thenReturn(Page.empty());
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Tư vấn.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var service = new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag);
        var answer = service.advise("Máy dưới 10 triệu bảo hành bao lâu?", List.of(), List.of(),
                new TopicRouter.Decision("SAME_TOPIC", null, true, true));
        verify(products).findByNameContainingIgnoreCase(anyString(), any());
        verify(rag).retrieve(anyString(), anyList());
        org.junit.jupiter.api.Assertions.assertTrue(answer.text().contains("chưa có đủ thông tin"));
    }
}
