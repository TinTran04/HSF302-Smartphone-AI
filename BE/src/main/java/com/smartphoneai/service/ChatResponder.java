package com.smartphoneai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import com.smartphoneai.exception.AiProviderException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatResponder {
    public record Source(String documentId, String documentName, Integer pageNumber, String excerpt) {}
    public record Answer(String text, List<Source> sources, List<ProductResponse> recommendedProducts, List<ProductResponse> comparedProducts) {
        public Answer(String text, List<Source> sources) { this(text,sources,List.of(),List.of()); }
    }
    private final AiProviderService provider;
    private final ObjectMapper mapper;
    private final PhoneAssistanceService phones;
    private final RagService rag;
    public ChatResponder(AiProviderService provider, ObjectMapper mapper, PhoneAssistanceService phones, RagService rag) {
        this.provider=provider; this.mapper=mapper; this.phones=phones; this.rag=rag;
    }
    public Answer answer(String topic, String question, List<ChatMessageResponse> history, List<String> productIds) {
        if ("SHOP_SUPPORT".equals(topic)) return rag.answer(question);
        if ("PHONE_CONSULTATION".equals(topic)) {
            var result=phones.consult(question,history);
            return new Answer(result.text(),List.of(),result.recommendedProducts(),List.of());
        }
        if ("PHONE_COMPARISON".equals(topic)) {
            var result=phones.compare(question,history,productIds);
            return new Answer(result.text(),List.of(),List.of(),result.comparedProducts());
        }
        if (!"GENERAL_CHAT".equals(topic)) throw new AiProviderException();
        try {
            String prompt = "Trả lời câu hỏi kiến thức chung bằng tiếng Việt. Không tự đưa ra chính sách hoặc giá riêng của cửa hàng. "
                    + "Lịch sử: " + mapper.writeValueAsString(history.stream().skip(Math.max(0, history.size()-12)).toList())
                    + "\nCâu hỏi: " + mapper.writeValueAsString(question);
            return new Answer(provider.chat(prompt), List.of());
        } catch (com.smartphoneai.exception.AiProviderException ex) { throw ex; }
        catch (Exception ex) { throw new AiProviderException(); }
    }
}
