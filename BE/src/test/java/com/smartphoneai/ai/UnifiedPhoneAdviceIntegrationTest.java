package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.dto.request.CreateConversationRequest;
import com.smartphoneai.entity.KnowledgeChunk;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.ProductVariant;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.repository.KnowledgeChunkRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AiChatService;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.KnowledgeVectorStore;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:unifiedadvice;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
class UnifiedPhoneAdviceIntegrationTest {
    @Autowired AiChatService chat;
    @Autowired UserAccountRepository users;
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

    @Test void abbreviatedModelPriceAndBrandFollowUpWorkThroughTheChatService() {
        when(provider.chat(anyString())).thenReturn("{\"result\":\"UNCERTAIN\"}");
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Customer", "0900000000", "x");
        user.activate();
        users.saveAndFlush(user);
        var auth = UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(user.getId()), "",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        var conversation = chat.create(auth, null,
                new CreateConversationRequest("PHONE_CONSULTATION", List.of()));
        var price = chat.send(auth, null, conversation, "tôi muốn mua 17 pro max thì giá bao nhiêu");
        assertEquals("ANSWER", price.get("type"));
        assertTrue(price.get("answer").toString().contains("Shop chưa bán sản phẩm"));
        var brand = chat.send(auth, null, conversation, "vậy nó là của hãng nào");
        assertEquals("ANSWER", brand.get("type"));
        assertTrue(brand.get("answer").toString().contains("iPhone 17 Pro Max"));
        assertTrue(brand.get("answer").toString().contains("Shop chưa bán sản phẩm"));
        assertFalse(brand.get("answer").toString().contains("Apple"));
        var detail = chat.detail(auth, null, conversation);
        assertEquals(4, ((List<?>) detail.get("messages")).size());
    }

    @Test void unavailableModelPurchaseIsAnsweredAndSavedEvenWhenProviderCannotConnect() {
        when(provider.chat(anyString())).thenThrow(new AiProviderException());
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Customer", "0900000000", "x");
        user.activate();
        users.saveAndFlush(user);
        var auth = UsernamePasswordAuthenticationToken.authenticated(new AccountPrincipal(user.getId()), "",
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        var conversation = chat.create(auth, null, new CreateConversationRequest("PHONE_CONSULTATION", List.of()));
        var result = chat.send(auth, null, conversation, "mình muốn mua điện thoại 18 promax", UUID.randomUUID());
        assertEquals("ANSWER", result.get("type"));
        assertTrue(result.get("answer").toString().contains("iPhone 18 Pro Max"));
        assertTrue(result.get("answer").toString().contains("Shop chưa bán sản phẩm"));
        assertEquals(2, ((List<?>) chat.detail(auth, null, conversation).get("messages")).size());
        verifyNoInteractions(provider);
    }

    @Test void generalPhoneKnowledgeCanUseGeminiWhenCatalogAndDocumentsAreEmpty() throws Exception {
        when(provider.chat(anyString())).thenReturn(response("OLED điều khiển ánh sáng theo từng điểm ảnh.", List.of(), List.of(), List.of()));
        var answer = responder.answer("PHONE_CONSULTATION", "Màn hình OLED là gì?", List.of(), List.of());
        assertEquals("OLED điều khiển ánh sáng theo từng điểm ảnh.", answer.text());
        assertTrue(answer.recommendedProducts().isEmpty());
        assertTrue(answer.sources().isEmpty());
        verify(vectors, never()).search(anyString(), anySet(), anyString());
        verify(provider).chat(argThat(prompt -> prompt.contains("chỉ trong phạm vi điện thoại")));
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
        var answer = responder.answer("PHONE_CONSULTATION", "So sánh hai máy này và giải thích OIS theo tài liệu cửa hàng.", List.of(), List.of(first, second));
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
