package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.entity.AiConversation;
import com.smartphoneai.entity.AiTopicSwitch;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.*;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import static org.mockito.Mockito.*;

class TopicSwitchLockOrderTest {
    @Test void cancelLocksConversationBeforeSwitch() {
        var guests = mock(AiGuestSessionRepository.class);
        var conversations = mock(AiConversationRepository.class);
        var messages = mock(AiMessageRepository.class);
        var switches = mock(AiTopicSwitchRepository.class);
        var user = UUID.randomUUID();
        var conversation = new AiConversation(user, null, "GENERAL_CHAT", "[]", Instant.now());
        var request = new AiTopicSwitch(conversation.getId(), "SHOP_SUPPORT", "Question", Instant.now());
        when(switches.findConversationId(request.getId())).thenReturn(Optional.of(conversation.getId()));
        when(switches.findLocked(request.getId())).thenReturn(Optional.of(request));
        when(conversations.findLocked(conversation.getId())).thenReturn(Optional.of(conversation));
        var service = new AiChatService(guests, conversations, messages, switches, mock(TopicRouter.class),
                mock(ChatResponder.class), new ObjectMapper(), Clock.systemUTC());
        service.cancel(new UsernamePasswordAuthenticationToken(new AccountPrincipal(user), null), null, request.getId());
        var order = inOrder(conversations, switches);
        order.verify(conversations).findLocked(conversation.getId());
        order.verify(switches).findLocked(request.getId());
    }
}
