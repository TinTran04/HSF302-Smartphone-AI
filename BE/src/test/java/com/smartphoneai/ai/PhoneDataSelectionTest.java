package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.RagService;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.impl.PhoneAssistanceServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PhoneDataSelectionTest {
    @Test void simplePhoneKnowledgeDoesNotSearchStoreDocumentsOrLoadCatalog() {
        var products = mock(ProductRepository.class);
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"RAM là bộ nhớ tạm.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag).advise("RAM điện thoại là gì?", List.of(), List.of());
        verify(rag, never()).retrieve(anyString(), anyList());
        verifyNoInteractions(products);
    }

    @Test void batteryCapacityIsNotTreatedAsBudget() {
        var products = mock(ProductRepository.class);
        when(products.findByActiveTrueAndNameContainingIgnoreCase(anyString(), any())).thenReturn(Page.empty());
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Cho mình thêm nhu cầu nhé.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag).advise("Tìm điện thoại pin 5.000 mAh", List.of(), List.of());
        verify(ai).chat(argThat(prompt -> prompt.contains("Ngân sách mua máy VND JSON: null")));
    }

    @Test void routerCanRequestDocumentsAndCatalogTogether() {
        var products = mock(ProductRepository.class);
        when(products.findByActiveTrueAndNameContainingIgnoreCase(anyString(), any())).thenReturn(Page.empty());
        var rag = mock(RagService.class);
        var ai = mock(AiProviderService.class);
        when(ai.chat(anyString())).thenReturn("{\"answer\":\"Tư vấn.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var service = new PhoneAssistanceServiceImpl(products, ai, new ObjectMapper(), rag);
        var answer = service.advise("Máy dưới 10 triệu bảo hành bao lâu?", List.of(), List.of(),
                new TopicRouter.Decision("SAME_TOPIC", null, true, true));
        verify(products).findByActiveTrueAndNameContainingIgnoreCase(anyString(), any());
        verify(rag).retrieve(anyString(), anyList());
        org.junit.jupiter.api.Assertions.assertTrue(answer.text().contains("chưa có đủ thông tin"));
    }
}
