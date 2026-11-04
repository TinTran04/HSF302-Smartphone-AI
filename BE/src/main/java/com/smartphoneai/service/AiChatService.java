package com.smartphoneai.service;

import com.smartphoneai.dto.request.CreateConversationRequest;
import org.springframework.security.core.Authentication;
import java.util.*;

public interface AiChatService {
    String createGuestSession();

    UUID create(Authentication auth, String token, CreateConversationRequest request);

    List<Map<String, Object>> list(Authentication auth, String token);

    Map<String, Object> detail(Authentication auth, String token, UUID id);

    Map<String, Object> send(Authentication auth, String token, UUID id, String rawContent);

    Map<String, Object> confirm(Authentication auth, String token, UUID switchId);

    void cancel(Authentication auth, String token, UUID switchId);

    List<String> claim(UUID userId, String token);
}
