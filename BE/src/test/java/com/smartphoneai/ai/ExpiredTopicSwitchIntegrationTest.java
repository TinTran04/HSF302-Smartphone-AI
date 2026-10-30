package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.TopicRouter;
import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:expiredswitch;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class ExpiredTopicSwitchIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean Clock clock;
    @MockitoBean TopicRouter router;

    @Test void expiredSwitchIsHiddenAndDoesNotBlockNewMessages() throws Exception {
        var now = new AtomicReference<>(Instant.parse("2026-01-01T00:00:00Z"));
        when(clock.instant()).thenAnswer(invocation -> now.get());
        when(router.route(anyString(), anyString(), anyList()))
                .thenReturn(new TopicRouter.Decision("DIFFERENT_TOPIC", "SHOP_SUPPORT"))
                .thenReturn(new TopicRouter.Decision("UNCERTAIN", null));
        var guest = mvc.perform(post("/api/ai/guest-sessions").with(csrf())).andExpect(status().isCreated()).andReturn();
        String token = mapper.readTree(guest.getResponse().getContentAsString()).path("guestSessionToken").asText();
        var created = mvc.perform(post("/api/ai/conversations").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"GENERAL_CHAT\"}"))
                .andExpect(status().isCreated()).andReturn();
        String id = mapper.readTree(created.getResponse().getContentAsString()).path("conversationId").asText();
        mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Question\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("SWITCH_REQUIRED"));
        now.set(now.get().plusSeconds(601));
        mvc.perform(get("/api/ai/conversations/" + id).header("X-Guest-Session", token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.pendingSwitch").doesNotExist());
        mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Another question\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("CLARIFICATION_REQUIRED"));
    }
}
