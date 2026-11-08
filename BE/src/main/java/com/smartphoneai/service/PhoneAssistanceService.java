package com.smartphoneai.service;

import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.dto.response.ProductResponse;
import java.util.*;

public interface PhoneAssistanceService {
    ChatResponder.Answer advise(String question, List<ChatMessageResponse> history, List<String> productIds);

    public record Recommendation(String text, List<ProductResponse> recommendedProducts) {}

    public record Comparison(String text, List<ProductResponse> comparedProducts) {}

    Recommendation consult(String question, List<ChatMessageResponse> history);

    Recommendation consult(String question, List<ChatMessageResponse> history, List<String> productIds);

    Comparison compare(String question, List<ChatMessageResponse> history, List<String> selectedIds);
}
