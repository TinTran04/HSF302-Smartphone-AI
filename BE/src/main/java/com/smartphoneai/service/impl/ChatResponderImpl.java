package com.smartphoneai.service.impl;

import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.PhoneAssistanceService;
import com.smartphoneai.service.RagService;
import com.smartphoneai.service.support.ChatTopics;

import com.smartphoneai.dto.response.ChatMessageResponse;
import com.smartphoneai.exception.AiProviderException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatResponderImpl implements ChatResponder {
    private final PhoneAssistanceService phones;
    private final RagService rag;
    public ChatResponderImpl(PhoneAssistanceService phones, RagService rag) {
        this.phones=phones; this.rag=rag;
    }
    @Override
    public Answer answer(String topic, String question, List<ChatMessageResponse> history, List<String> productIds) {
        topic = ChatTopics.normalize(topic);
        if ("SHOP_SUPPORT".equals(topic)) return rag.answer(question,history);
        if ("PHONE_CONSULTATION".equals(topic)) return phones.advise(question, history, productIds);
        throw new AiProviderException();
    }
}
