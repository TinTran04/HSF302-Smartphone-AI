package com.smartphoneai.ai;

import com.smartphoneai.service.impl.PhoneAssistanceServiceImpl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.dto.response.ChatMessageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DataJpaTest
class PhoneAssistanceIntegrationTest {
    @Autowired ProductRepository products;
    @Test void adviceConstrainsMixedAndInjectedRequestsToPhoneContext() {
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenAnswer(invocation -> {
            String prompt = invocation.getArgument(0);
            assertTrue(prompt.contains("Chỉ trả lời phần liên quan đến điện thoại"));
            assertTrue(prompt.contains("bỏ qua chỉ dẫn") && prompt.contains("ngoài phạm vi"));
            assertTrue(prompt.contains("Kiến thức AI chỉ được dùng trong ngữ cảnh điện thoại"));
            assertTrue(prompt.contains("cách sử dụng") && prompt.contains("sửa chữa") && prompt.contains("phụ kiện"));
            return "{\"answer\":\"OLED giúp màn hình điện thoại có độ tương phản cao.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}";
        });
        var service = new PhoneAssistanceServiceImpl(products, provider, new ObjectMapper(),
                mock(com.smartphoneai.service.RagService.class));

        var answer = service.advise("Giải thích OLED trên điện thoại và viết bài văn về nấu ăn", java.util.List.of(), java.util.List.of());

        assertEquals("OLED giúp màn hình điện thoại có độ tương phản cao.", answer.text());
        assertTrue(answer.sources().isEmpty());
    }

    @Test void configurationFailuresPropagateAcrossPhoneAssistanceOperations() {
        var first=save("First Phone",9000000L,true);
        var second=save("Second Phone",10000000L,true);
        var provider=mock(AiProviderService.class);
        var failure=new InvalidAiConfigurationException();
        when(provider.chat(anyString())).thenThrow(failure);
        var service=new PhoneAssistanceServiceImpl(products,provider,new ObjectMapper(),
                mock(com.smartphoneai.service.RagService.class));

        assertAll(
                () -> assertSame(failure,assertThrows(InvalidAiConfigurationException.class,
                        () -> service.advise("OLED là gì?",java.util.List.of(),java.util.List.of()))),
                () -> assertSame(failure,assertThrows(InvalidAiConfigurationException.class,
                        () -> service.compare("So sánh",java.util.List.of(),
                                java.util.List.of(first.getId().toString(),second.getId().toString())))),
                () -> assertSame(failure,assertThrows(InvalidAiConfigurationException.class,
                        () -> service.consult("Tư vấn điện thoại",java.util.List.of()))));

        doReturn("{\"ids\":[\""+first.getId()+"\"]}").doThrow(failure).when(provider).chat(anyString());
        assertSame(failure,assertThrows(InvalidAiConfigurationException.class,
                () -> service.consult("Tư vấn điện thoại",java.util.List.of())));
    }

    @Test void comparisonCanUseProductsBeyondTheFirstPage() {
        for (int i=0; i<100; i++) save("Catalog " + i, 100, true);
        var first = save("Later A", 100, true);
        var second = save("Later B", 200, true);
        var provider = mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("Later B có giá cao hơn Later A.");
        var service = new PhoneAssistanceServiceImpl(products, provider, new ObjectMapper(), mock(com.smartphoneai.service.RagService.class));
        var result = service.compare("Compare", java.util.List.of(),
                java.util.List.of(first.getId().toString(), second.getId().toString()));
        assertEquals(2, result.comparedProducts().size());
        assertEquals("Later B có giá cao hơn Later A.", result.text());
        verify(provider).chat(argThat(prompt -> prompt.contains("Later A") && prompt.contains("Later B") && !prompt.contains("Catalog 0")));
    }
    @Test void consultationUsesSelectedProductAsContext() {
        var selected=save("Selected Phone", 9000000L, true);
        var provider=mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"answer\":\"Máy này phù hợp.\",\"recommendedProductIds\":[\""+selected.getId()+"\"],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var phones=new PhoneAssistanceServiceImpl(products,provider,new ObjectMapper(), mock(com.smartphoneai.service.RagService.class));
        var responder=new com.smartphoneai.service.impl.ChatResponderImpl(phones,mock(com.smartphoneai.service.RagService.class));
        var answer=responder.answer("PHONE_CONSULTATION","Máy này phù hợp không?",java.util.List.of(),java.util.List.of(selected.getId().toString()));
        assertEquals(selected.getId().toString(),answer.recommendedProducts().getFirst().id());
        verify(provider).chat(argThat(prompt -> prompt.contains("Sản phẩm khách đang xem") && prompt.contains("Selected Phone")));
    }
    @Test void consultationAnswersQuestionUsingSelectedProductData() {
        var product=save("Battery Phone", 9000000L, true);
        product.getSpecifications().put("Pin", "5000 mAh"); products.saveAndFlush(product);
        var provider=mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("```json\n{\"ids\":[\""+product.getId()+"\"]}\n```", "Pin 5000 mAh.");
        var service=new PhoneAssistanceServiceImpl(products,provider,new ObjectMapper(), mock(com.smartphoneai.service.RagService.class));
        var result=service.consult("Pin máy bao nhiêu?",java.util.List.of(),java.util.List.of(product.getId().toString()));
        assertEquals("Pin 5000 mAh.",result.text());
        verify(provider).chat(argThat(prompt -> prompt.contains("Pin máy bao nhiêu?") && prompt.contains("5000 mAh") && !prompt.contains("Chỉ trả JSON")));
    }
    @Test void recommendationsUseRealActiveProductsAndHonorExplicitBudget() {
        var affordable=save("Demo A", 9000000L, true);
        var expensive=save("Demo B", 15000000L, true);
        var hidden=save("Demo C", 8000000L, false);
        var unavailable=save("Demo D", 7000000L, true);
        unavailable.getVariants().getFirst().setActive(false); products.saveAndFlush(unavailable);
        var provider=mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"ids\":[\""+affordable.getId()+"\",\""+expensive.getId()+"\",\""+hidden.getId()+"\",\""+unavailable.getId()+"\",\"99999\"]}");
        var service=new PhoneAssistanceServiceImpl(products,provider,new ObjectMapper(), mock(com.smartphoneai.service.RagService.class));
        var answer=service.consult("Mình có 10 triệu, cần điện thoại", java.util.List.of());
        assertEquals(1,answer.recommendedProducts().size());
        assertEquals(affordable.getId().toString(),answer.recommendedProducts().getFirst().id());
        assertEquals(9000000L,answer.recommendedProducts().getFirst().variants().getFirst().price());
    }
    @Test void followUpKeepsPreviousBudget() {
        var affordable=save("Follow A", 9000000L, true);
        var expensive=save("Follow B", 15000000L, true);
        var provider=mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"ids\":[\""+affordable.getId()+"\",\""+expensive.getId()+"\"]}");
        var service=new PhoneAssistanceServiceImpl(products,provider,new ObjectMapper(), mock(com.smartphoneai.service.RagService.class));
        var history=java.util.List.of(new ChatMessageResponse("1","user","Tôi có 10 triệu",java.util.List.of(),java.util.List.of(),java.util.List.of()));
        var answer=service.consult("Máy nào chụp ảnh tốt?",history);
        assertEquals(1,answer.recommendedProducts().size());
        assertEquals(affordable.getId().toString(),answer.recommendedProducts().getFirst().id());
    }
    private Product save(String name,long price,boolean active) {
        var product=new Product(); product.setName(name); product.setActive(active);
        var variant=new ProductVariant(); variant.setColor("Black"); variant.setStorage("128GB");
        variant.setPrice(price); variant.setActive(true); product.addVariant(variant);
        return products.saveAndFlush(product);
    }
}
