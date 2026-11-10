package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.KnowledgeChunk;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.KnowledgeChunkRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.KnowledgeVectorStore;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:unifiedadvice;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
class UnifiedPhoneAdviceIntegrationTest {
    @Autowired ChatResponder responder;
    @Autowired ProductRepository products;
    @Autowired KnowledgeDocumentRepository documents;
    @Autowired KnowledgeChunkRepository chunks;
    @Autowired ObjectMapper mapper;
    @MockitoBean AiProviderService provider;
    @MockitoBean KnowledgeVectorStore vectors;
    @MockitoBean OtpSender mail;

    @BeforeEach void clearData() {
        chunks.deleteAll();
        documents.deleteAll();
        products.deleteAll();
    }

    @Test void explainsTechnologyUsingAiKnowledgeWhenCatalogAndDocumentsAreEmpty() throws Exception {
        when(provider.chat(anyString())).thenReturn(response("OLED điều khiển ánh sáng theo từng điểm ảnh.", List.of(), List.of(), List.of()));
        var answer = responder.answer("PHONE_CONSULTATION", "Màn hình OLED là gì?", List.of(), List.of());
        assertEquals("OLED điều khiển ánh sáng theo từng điểm ảnh.", answer.text());
        assertTrue(answer.recommendedProducts().isEmpty());
        assertTrue(answer.sources().isEmpty());
        verify(vectors, never()).search(anyString(), anySet(), anyString());
    }

    @Test void productAndDocumentLookupsReleaseTransactionBeforeExternalCalls() throws Exception {
        phone("Test Phone", 9000000);
        var doc=documents.saveAndFlush(new KnowledgeDocument("policy.txt",100,"[]",Instant.now()));
        doc.ready("embedding-v1");
        documents.saveAndFlush(doc);
        var chunk=chunks.saveAndFlush(new KnowledgeChunk(doc.getId(),null,"Bảo hành 12 tháng.","embedding-v1"));
        when(vectors.currentVersion()).thenReturn("embedding-v1");
        when(vectors.search(anyString(),anySet(),eq("embedding-v1"))).thenAnswer(invocation -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return List.of(new KnowledgeVectorStore.Hit(chunk.getId(),0.95));
        });
        when(provider.chat(anyString())).thenAnswer(invocation -> {
            assertFalse(org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive());
            return response("Bảo hành 12 tháng.",List.of(),List.of(),List.of(chunk.getId().toString()));
        });
        var answer=responder.answer("PHONE_CONSULTATION","Tư vấn máy 10 triệu và bảo hành bao lâu?",List.of(),List.of());
        assertEquals("Bảo hành 12 tháng.",answer.text());
    }

    @Test void combinesCatalogDocumentEvidenceAndComparisonInOneConsultation() throws Exception {
        var first = phone("Camera Phone", 9000000);
        var second = phone("Battery Phone", 11000000);
        var doc = documents.saveAndFlush(new KnowledgeDocument("camera-guide.txt", 100, "[]", Instant.now()));
        doc.ready("embedding-v1");
        documents.saveAndFlush(doc);
        var chunk = chunks.saveAndFlush(new KnowledgeChunk(doc.getId(), null, "OIS hỗ trợ ổn định hình ảnh khi cầm tay.", "embedding-v1"));
        when(vectors.currentVersion()).thenReturn("embedding-v1");
        when(vectors.search(anyString(), anySet(), eq("embedding-v1")))
                .thenReturn(List.of(new KnowledgeVectorStore.Hit(chunk.getId(), 0.95)));
        when(provider.chat(anyString())).thenReturn(response("Hai máy có mức giá khác nhau. Tài liệu giải thích lợi ích của OIS.",
                List.of(), List.of(first, second), List.of(chunk.getId().toString())));
        var answer = responder.answer("PHONE_CONSULTATION", "So sánh hai máy này và giải thích OIS.", List.of(), List.of(first, second));
        assertEquals(2, answer.comparedProducts().size());
        assertEquals(doc.getId().toString(), answer.sources().getFirst().documentId());
        verify(provider).chat(argThat(prompt -> prompt.contains("Camera Phone") && prompt.contains("Battery Phone")
                && prompt.contains("OIS hỗ trợ") && prompt.contains("citedChunkIds") && !prompt.contains("camera-guide.txt")));
    }

    @Test void rejectsFabricatedDocumentCitation() throws Exception {
        phone("Phone", 9000000);
        when(provider.chat(anyString())).thenReturn(response("Theo tài liệu giả.", List.of(), List.of(), List.of("made-up-chunk")));
        assertThrows(AiProviderException.class, () -> responder.answer("PHONE_CONSULTATION", "Giải thích camera.", List.of(), List.of()));
    }

    @Test void rejectsFabricatedProductCard() throws Exception {
        phone("Phone", 9000000);
        when(provider.chat(anyString())).thenReturn(response("Gợi ý máy.", List.of("999999999"), List.of(), List.of()));
        assertThrows(AiProviderException.class, () -> responder.answer("PHONE_CONSULTATION", "Máy nào phù hợp?", List.of(), List.of()));
    }

    private String phone(String name, long price) {
        var product = new Product();
        product.setName(name);
        product.setActive(true);
        var variant = new ProductVariant();
        variant.setColor("Black");
        variant.setStorage("128GB");
        variant.setPrice(price);
        variant.setActive(true);
        product.addVariant(variant);
        return products.saveAndFlush(product).getId().toString();
    }

    private String response(String answer, List<String> recommendations, List<String> comparisons, List<String> citations) throws Exception {
        return mapper.writeValueAsString(Map.of("answer", answer, "recommendedProductIds", recommendations,
                "comparedProductIds", comparisons, "citedChunkIds", citations));
    }
}
