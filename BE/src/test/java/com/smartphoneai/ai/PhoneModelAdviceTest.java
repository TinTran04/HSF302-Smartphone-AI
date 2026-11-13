package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.RagService;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.impl.PhoneAssistanceServiceImpl;
import com.smartphoneai.service.impl.ProductCatalogReader;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class PhoneModelAdviceTest {
    private final AiProviderService provider = mock(AiProviderService.class);
    private final ProductCatalogReader catalog = mock(ProductCatalogReader.class);

    private PhoneAssistanceServiceImpl service() {
        when(provider.chat(anyString())).thenReturn("{\"answer\":\"Giá 99 triệu và có sẵn.\",\"recommendedProductIds\":[],\"comparedProductIds\":[],\"citedChunkIds\":[]}");
        var service = new PhoneAssistanceServiceImpl(mock(ProductRepository.class), provider, new ObjectMapper(), mock(RagService.class));
        service.setCatalogReader(catalog);
        return service;
    }

    @ParameterizedTest
    @ValueSource(strings = {"tôi muốn mua 17 pro max thì giá bao nhiêu", "ip17promax giá bao nhiêu?", "17 promax ở cửa hàng giá bao nhiêu?", "mình muốn mua điện thoại 18 promax"})
    void missingCatalogModelCannotReceiveInventedStorePrice(String question) {
        when(catalog.read()).thenReturn(List.of(phone("other", "iPhone 16 Pro Max", 25_000_000)));
        var answer = service().advise(question, List.of(), List.of());
        assertTrue(answer.text().contains(question.contains("18") ? "iPhone 18 Pro Max" : "iPhone 17 Pro Max"));
        assertTrue(answer.text().contains("Shop chưa bán sản phẩm"));
        assertFalse(answer.text().contains("99 triệu"));
        assertFalse(answer.text().contains("có sẵn"));
        assertTrue(answer.recommendedProducts().isEmpty());
        verifyNoInteractions(provider);
    }

    @Test void catalogPriceOverridesAnIncorrectKnowledgeOnlyDecision() {
        when(catalog.read()).thenReturn(List.of(phone("17", "iPhone 17 Pro Max", 31_234_000), phone("16", "iPhone 16 Pro Max", 25_000_000)));
        var answer = service().advise("17 promax giá bao nhiêu?", List.of(), List.of(),
                new TopicRouter.Decision("SAME_TOPIC", null, false, false));
        assertTrue(answer.text().contains("31.234.000"));
        assertEquals(List.of("17"), answer.recommendedProducts().stream().map(ProductResponse::id).toList());
        assertFalse(answer.text().contains("99 triệu"));
    }

    @Test void missingModelBrandCannotBeAnsweredFromGeneralKnowledge() {
        var answer = service().advise("vậy 17 promax là của hãng nào", List.of(), List.of());
        assertTrue(answer.text().contains("iPhone 17 Pro Max"));
        assertTrue(answer.text().contains("Shop chưa bán sản phẩm"));
        assertFalse(answer.text().contains("Apple"));
        assertTrue(answer.recommendedProducts().isEmpty());
        verifyNoInteractions(provider);
    }

    @Test void existingModelBrandComesFromCatalog() {
        when(catalog.read()).thenReturn(List.of(phone("17", "iPhone 17 Pro Max", 31_234_000)));
        var answer = service().advise("vậy 17 promax là của hãng nào", List.of(), List.of());
        assertTrue(answer.text().contains("Apple"));
        verifyNoInteractions(provider);
    }

    @Test void missingBrandOnExistingProductIsNotGuessedFromTheModelName() {
        var phone = phone("17", "iPhone 17 Pro Max", 31_234_000);
        when(catalog.read()).thenReturn(List.of(new ProductResponse(phone.id(), phone.name(), null, null,
                phone.status(), phone.description(), phone.images(), phone.specifications(), phone.variants())));
        var answer = service().advise("17 promax là của hãng nào", List.of(), List.of());
        assertTrue(answer.text().contains("chưa có đủ dữ liệu"));
        assertFalse(answer.text().contains("Apple"));
        assertFalse(answer.text().contains("chưa bán"));
        verifyNoInteractions(provider);
    }

    @Test void outOfStockProductIsRecognizedWithoutOfferingAnActiveVariant() {
        var phone = phone("17", "iPhone 17 Pro Max", 31_234_000);
        when(catalog.read()).thenReturn(List.of(new ProductResponse(phone.id(), phone.name(), phone.brandId(), phone.brandName(),
                "INACTIVE", phone.description(), phone.images(), phone.specifications(), phone.variants())));
        var answer = service().advise("17 promax giá bao nhiêu?", List.of(), List.of());
        assertTrue(answer.text().contains("hết hàng"));
        assertFalse(answer.text().contains("chưa bán"));
        assertTrue(answer.recommendedProducts().isEmpty());
        verifyNoInteractions(provider);
    }

    @Test void catalogModelWithStorageSuffixIsStillRecognized() {
        when(catalog.read()).thenReturn(List.of(phone("s25", "Samsung Galaxy S25 Ultra 256GB", 25_000_000)));
        var answer = service().advise("Samsung Galaxy S25 Ultra có camera gì?", List.of(), List.of());
        verify(provider).chat(argThat(prompt -> prompt.contains("Samsung Galaxy S25 Ultra 256GB")
                && prompt.contains("Nếu máy có trong catalog nhưng thiếu thông số")));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Samsung Galaxy S25 Ultra có camera gì?", "OPPO Find X9 Pro có bán không?",
            "So sánh iPhone 16 Pro Max với iPhone 17 Pro Max", "iPhone 17 Pro Max pin bao nhiêu?"})
    void missingModelsAreRejectedBeforeAskingGeminiForSpecificationsOrComparisons(String question) {
        when(catalog.read()).thenReturn(List.of(phone("16", "iPhone 16 Pro Max", 25_000_000)));
        var answer = service().advise(question, List.of(), List.of());
        assertTrue(answer.text().contains("Shop chưa bán sản phẩm"));
        assertTrue(answer.recommendedProducts().isEmpty());
        assertTrue(answer.comparedProducts().isEmpty());
        verifyNoInteractions(provider);
    }

    @Test void contextualPriceQuestionKeepsTheModelFromThePreviousUserTurn() {
        when(catalog.read()).thenReturn(List.of());
        var history = List.of(new ChatMessageResponse("1", "user", "17 promax là của hãng nào", List.of(), List.of(), List.of()));
        var answer = service().advise("vậy giá bao nhiêu?", history, List.of());
        assertTrue(answer.text().contains("iPhone 17 Pro Max"));
        assertTrue(answer.text().contains("Shop chưa bán sản phẩm"));
    }

    @Test void explicitPriceAnswerKeepsRecommendationCardsWithinThePreviousBudget() {
        when(catalog.read()).thenReturn(List.of(phone("17", "iPhone 17 Pro Max", 31_234_000)));
        var history = List.of(new ChatMessageResponse("1", "user", "Tôi có 10 triệu", List.of(), List.of(), List.of()));
        var answer = service().advise("17 promax giá bao nhiêu?", history, List.of());
        assertTrue(answer.text().contains("31.234.000"));
        assertTrue(answer.recommendedProducts().isEmpty());
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void modelWithoutActiveVariantsCannotProduceAPriceOrPurchasableCard(boolean hasInactiveVariant) {
        var variants = hasInactiveVariant
                ? List.of(new ProductResponse.VariantResponse("17-v", "Black", "#000000", "256GB", 31_234_000, "INACTIVE", null))
                : List.<ProductResponse.VariantResponse>of();
        when(catalog.read()).thenReturn(List.of(new ProductResponse("17", "iPhone 17 Pro Max", "apple", "Apple",
                "ACTIVE", "", List.of(), Map.of(), variants)));
        var answer = service().advise("17 promax giá bao nhiêu?", List.of(), List.of());
        assertTrue(answer.text().contains("hết hàng"));
        assertFalse(answer.text().contains("31.234.000"));
        assertFalse(answer.text().contains("9.223.372.036.854.775.807"));
        assertTrue(answer.recommendedProducts().isEmpty());
    }

    private ProductResponse phone(String id, String name, long price) {
        return new ProductResponse(id, name, "apple", "Apple", "ACTIVE", "", List.of(), Map.of(),
                List.of(new ProductResponse.VariantResponse(id + "-v", "Black", "#000000", "256GB", price, "ACTIVE", null)));
    }
}
