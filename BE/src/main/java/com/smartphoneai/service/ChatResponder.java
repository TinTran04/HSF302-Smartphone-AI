package com.smartphoneai.service;

import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import java.util.List;

public interface ChatResponder {
    public record Source(String documentId, String documentName, Integer pageNumber, String excerpt) {}

    public record Answer(String text, List<Source> sources, List<ProductResponse> recommendedProducts,
                         List<ProductResponse> comparedProducts) {
        public Answer(String text, List<Source> sources) { this(text,sources,List.of(),List.of()); }
    }

    Answer answer(String topic, String question, List<ChatMessageResponse> history,
                  List<String> productIds);
}
