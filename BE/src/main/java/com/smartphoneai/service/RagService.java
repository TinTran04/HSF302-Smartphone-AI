package com.smartphoneai.service;

import java.util.*;

public interface RagService {
    record Evidence(String chunkId, java.time.Instant updatedAt, String content, ChatResponder.Source source) {}

    List<Evidence> retrieve(String question, List<com.smartphoneai.dto.response.ChatMessageResponse> history);

    ChatResponder.Answer answer(String question);

    ChatResponder.Answer answer(String question, List<com.smartphoneai.dto.response.ChatMessageResponse> history);
}
