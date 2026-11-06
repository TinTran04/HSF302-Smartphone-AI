package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.RagService;
import com.smartphoneai.service.impl.PhoneAssistanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@DataJpaTest
class PhoneBudgetIntegrationTest {
    @Autowired ProductRepository products;
    final ObjectMapper mapper = new ObjectMapper();
    AiProviderService provider;
    PhoneAssistanceServiceImpl phones;

    @BeforeEach void setup() {
        provider = mock(AiProviderService.class);
        phones = new PhoneAssistanceServiceImpl(products, provider, mapper, mock(RagService.class));
    }

    @Test void acceptsExactlyTenPercentOverBudgetAndAddsDeterministicDisclosure() throws Exception {
        var phone = save("Máy sát giới hạn", 11000000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        var result = phones.advise("Tôi có 10 triệu", List.of(), List.of());

        assertEquals(1, result.recommendedProducts().size());
        assertTrue(result.text().contains("Máy sát giới hạn"));
        assertTrue(result.text().contains("11.000.000"));
        assertTrue(result.text().contains("1.000.000"));
        assertTrue(result.text().contains("10%"));
    }

    @Test void rejectsARecommendationOneDongAboveTheAllowance() throws Exception {
        var phone = save("Vượt giới hạn", 11000001);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        assertThrows(AiProviderException.class, () -> phones.advise("Tối đa 10tr", List.of(), List.of()));
    }

    @Test void exactBudgetDoesNotReceiveAnOverBudgetNotice() throws Exception {
        var phone = save("Đúng ngân sách", 10000000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        assertEquals("Gợi ý điện thoại.", phones.advise("Tôi có 10 triệu", List.of(), List.of()).text());
    }

    @Test void placesWithinBudgetRecommendationsBeforeMoreExpensiveOptions() throws Exception {
        var over = save("Máy cao hơn", 10500000);
        var within = save("Máy vừa tiền", 9500000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(over.getId().toString(), within.getId().toString())));

        var result = phones.advise("Có 10 triệu cần máy chụp ảnh", List.of(), List.of());

        assertEquals(List.of(within.getId().toString(), over.getId().toString()),
                result.recommendedProducts().stream().map(product -> product.id()).toList());
        assertTrue(result.text().contains("500.000"));
        assertTrue(result.text().contains("5%"));
    }

    @Test void aRangeUsesTheUpperAmountAndAllowsTenPercentAboveIt() throws Exception {
        var phone = save("Máy cho khoảng giá", 16500000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        var result = phones.advise("Từ 10 triệu đến 15 triệu", List.of(), List.of());

        assertTrue(result.text().contains("1.500.000"));
        assertTrue(result.text().contains("10%"));
    }

    @Test void decimalAndFullVndAmountsHaveTheSameAllowance() throws Exception {
        var phone = save("Máy thập phân", 11550000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        for (String amount : List.of("10,5 triệu", "10.5tr", "10.500.000đ", "10500000 VND")) {
            var result = phones.advise("Tôi có " + amount, List.of(), List.of());
            assertTrue(result.text().contains("1.050.000"), amount);
            assertTrue(result.text().contains("10%"), amount);
        }
    }

    @Test void mixedUnitRangesUseTheirUpperAmount() throws Exception {
        var phone = save("Máy khoảng giá hỗn hợp", 16500000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        for (String amount : List.of("10 triệu đến 15.000.000đ", "10.000.000đ - 15 triệu", "10–15 triệu")) {
            var result = phones.advise("Tôi có từ " + amount, List.of(), List.of());
            assertTrue(result.text().contains("1.500.000"), amount);
        }
    }

    @Test void aFollowUpUsesTheCustomersPreviousBudget() throws Exception {
        var phone = save("Máy theo ngữ cảnh", 10500000);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));
        var history = List.of(new ChatMessageResponse("1", "user", "Tôi có 10 triệu", List.of(), List.of(), List.of()));

        var result = phones.advise("Máy nào pin tốt?", history, List.of());

        assertTrue(result.text().contains("500.000"));
        assertTrue(result.text().contains("5%"));
    }

    @Test void mixedVariantsAreCappedAndEveryOverBudgetOptionIsDisclosed() throws Exception {
        var phone = save("Máy nhiều phiên bản", 9500000);
        addVariant(phone, "256GB", 10500000);
        addVariant(phone, "512GB", 12000000);
        products.saveAndFlush(phone);
        when(provider.chat(anyString())).thenReturn(answer(List.of(phone.getId().toString())));

        var result = phones.advise("Tôi có 10 triệu", List.of(), List.of());

        assertEquals(2, result.recommendedProducts().getFirst().variants().size());
        assertTrue(result.text().contains("256GB"));
        assertTrue(result.text().contains("500.000"));
        assertFalse(result.text().contains("512GB"));
    }

    @Test void legacyConsultationUsesTheSameAllowanceAndDisclosure() throws Exception {
        var phone = save("Máy luồng cũ", 10500000);
        when(provider.chat(anyString())).thenReturn("{\"ids\":[\"" + phone.getId() + "\"]}", "Gợi ý điện thoại.");

        var result = phones.consult("Tôi có 10 triệu", List.of());

        assertEquals(1, result.recommendedProducts().size());
        assertTrue(result.text().contains("Máy luồng cũ"));
        assertTrue(result.text().contains("500.000"));
    }

    private Product save(String name, long price) {
        var phone = new Product();
        phone.setName(name);
        phone.setActive(true);
        addVariant(phone, "128GB", price);
        return products.saveAndFlush(phone);
    }

    private void addVariant(Product phone, String storage, long price) {
        var variant = new ProductVariant();
        variant.setStorage(storage);
        variant.setColor("Đen");
        variant.setPrice(price);
        variant.setActive(true);
        phone.addVariant(variant);
    }

    private String answer(List<String> ids) throws Exception {
        return mapper.writeValueAsString(Map.of("answer", "Gợi ý điện thoại.", "recommendedProductIds", ids,
                "comparedProductIds", List.of(), "citedChunkIds", List.of()));
    }
}
