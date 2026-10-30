package com.smartphoneai.dto.response;
import com.smartphoneai.service.ChatResponder;
import java.util.List;
public record ChatMessageResponse(String id, String role, String content, List<ChatResponder.Source> sources,
                                  List<ProductResponse> recommendedProducts, List<ProductResponse> comparedProducts) {}
