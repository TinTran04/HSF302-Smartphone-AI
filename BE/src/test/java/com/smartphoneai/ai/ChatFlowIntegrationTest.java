package com.smartphoneai.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.ChatResponder;
import com.smartphoneai.service.TopicRouter;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import java.util.concurrent.atomic.AtomicReference;
import java.util.Map;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:chatflow;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class ChatFlowIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean OtpSender otpSender;
    @MockitoBean TopicRouter router;
    @MockitoBean ChatResponder responder;

    @Test void rejectedSwitchDoesNotProcessQuestionAndOtherGuestCannotReadConversation() throws Exception {
        when(router.route(anyString(), anyString(), anyList()))
                .thenReturn(new TopicRouter.Decision("DIFFERENT_TOPIC", "SHOP_SUPPORT"))
                .thenReturn(new TopicRouter.Decision("UNCERTAIN", null));
        var first = mvc.perform(post("/api/ai/guest-sessions").with(csrf())).andExpect(status().isCreated()).andReturn();
        var second = mvc.perform(post("/api/ai/guest-sessions").with(csrf())).andExpect(status().isCreated()).andReturn();
        String token = mapper.readTree(first.getResponse().getContentAsString()).path("guestSessionToken").asText();
        String other = mapper.readTree(second.getResponse().getContentAsString()).path("guestSessionToken").asText();
        var created = mvc.perform(post("/api/ai/conversations").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"GENERAL_CHAT\"}"))
                .andExpect(status().isCreated()).andReturn();
        String id = mapper.readTree(created.getResponse().getContentAsString()).path("conversationId").asText();
        mvc.perform(get("/api/ai/conversations/" + id).header("X-Guest-Session", other)).andExpect(status().isNotFound());
        var suggested = mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Bảo hành bao lâu?\"}"))
                .andExpect(status().isOk()).andReturn();
        String switchId = mapper.readTree(suggested.getResponse().getContentAsString()).path("switchRequestId").asText();
        mvc.perform(post("/api/ai/topic-switches/" + switchId + "/cancel").header("X-Guest-Session", token).with(csrf()))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").header("X-Guest-Session", token).with(csrf()))
                .andExpect(status().isConflict());
        mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Mình muốn hỏi thêm\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("CLARIFICATION_REQUIRED"));
        verifyNoInteractions(responder);
    }

    @Test void guestMustConfirmTopicSwitchAndHasTwoMessagesAcrossConversations() throws Exception {
        when(router.route(eq("PHONE_CONSULTATION"), anyString(), anyList()))
                .thenReturn(new TopicRouter.Decision("DIFFERENT_TOPIC", "SHOP_SUPPORT"));
        when(router.route(eq("SHOP_SUPPORT"), anyString(), anyList()))
                .thenReturn(new TopicRouter.Decision("SAME_TOPIC", null));
        when(responder.answer(anyString(), anyString(), anyList(), anyList()))
                .thenReturn(new ChatResponder.Answer("Tài liệu demo", java.util.List.of()));
        var guest = mvc.perform(post("/api/ai/guest-sessions").with(csrf())).andExpect(status().isCreated()).andReturn();
        String token = mapper.readTree(guest.getResponse().getContentAsString()).path("guestSessionToken").asText();
        var created = mvc.perform(post("/api/ai/conversations").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"PHONE_CONSULTATION\"}"))
                .andExpect(status().isCreated()).andReturn();
        String id = mapper.readTree(created.getResponse().getContentAsString()).path("conversationId").asText();
        var empty = mvc.perform(post("/api/ai/conversations").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"topic\":\"GENERAL_CHAT\"}"))
                .andExpect(status().isCreated()).andReturn();
        String emptyId = mapper.readTree(empty.getResponse().getContentAsString()).path("conversationId").asText();
        var switchResponse = mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Shop bảo hành bao lâu?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("SWITCH_REQUIRED")).andReturn();
        verifyNoInteractions(responder);
        String switchId = mapper.readTree(switchResponse.getResponse().getContentAsString()).path("switchRequestId").asText();
        var confirmed = mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").header("X-Guest-Session", token).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("ANSWER")).andReturn();
        String newId = mapper.readTree(confirmed.getResponse().getContentAsString()).path("newConversationId").asText();
        mvc.perform(post("/api/ai/topic-switches/" + switchId + "/confirm").header("X-Guest-Session", token).with(csrf()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.newConversationId").value(newId));
        verify(responder, times(1)).answer(anyString(), anyString(), anyList(), anyList());
        mvc.perform(post("/api/ai/conversations/" + newId + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Còn đổi trả?\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.type").value("ANSWER"));
        mvc.perform(post("/api/ai/conversations/" + id + "/messages").header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Tin thứ ba\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("GUEST_MESSAGE_LIMIT"));
        mvc.perform(get("/api/ai/conversations/" + id).header("X-Guest-Session", token)).andExpect(status().isOk());
        mvc.perform(get("/api/ai/conversations/" + id)).andExpect(status().isUnauthorized());
        var code = new AtomicReference<String>();
        doAnswer(inv -> { code.set(inv.getArgument(1)); return null; }).when(otpSender).send(anyString(), anyString());
        var session = new MockHttpSession();
        var registration = mvc.perform(post("/api/auth/register").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"chat@example.com\",\"password\":\"Password123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String challengeId = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/otp/verify").session(session).header("X-Guest-Session", token).with(csrf())
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(Map.of("challengeId", challengeId, "code", code.get()))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mergedConversationIds.length()").value(2));
        mvc.perform(get("/api/ai/conversations/" + id).session(session)).andExpect(status().isOk());
        mvc.perform(get("/api/ai/conversations/" + emptyId).session(session)).andExpect(status().isNotFound());
        mvc.perform(get("/api/ai/conversations/" + id).header("X-Guest-Session", token)).andExpect(status().isUnauthorized());
    }
}
