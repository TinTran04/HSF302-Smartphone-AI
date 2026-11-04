package com.smartphoneai.service;

import java.util.*;

public interface RagService {
    ChatResponder.Answer answer(String question);

    ChatResponder.Answer answer(String question, List<com.smartphoneai.dto.response.ChatMessageResponse> history);
}
