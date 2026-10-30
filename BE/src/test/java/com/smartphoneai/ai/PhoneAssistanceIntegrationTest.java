package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.PhoneAssistanceService;
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
    @Test void comparisonCanUseProductsBeyondTheFirstPage() {
        for (int i=0; i<100; i++) save("Catalog " + i, 100, true);
        var first = save("Later A", 100, true);
        var second = save("Later B", 200, true);
        var service = new PhoneAssistanceService(products, mock(AiProviderService.class), new ObjectMapper());
        var result = service.compare("Compare", java.util.List.of(),
                java.util.List.of(first.getId().toString(), second.getId().toString()));
        assertEquals(2, result.comparedProducts().size());
    }
    @Test void recommendationsUseRealActiveProductsAndHonorExplicitBudget() {
        var affordable=save("Demo A", 9000000L, true);
        var expensive=save("Demo B", 15000000L, true);
        var hidden=save("Demo C", 8000000L, false);
        var provider=mock(AiProviderService.class);
        when(provider.chat(anyString())).thenReturn("{\"ids\":[\""+affordable.getId()+"\",\""+expensive.getId()+"\",\""+hidden.getId()+"\",\"99999\"]}");
        var service=new PhoneAssistanceService(products,provider,new ObjectMapper());
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
        var service=new PhoneAssistanceService(products,provider,new ObjectMapper());
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
