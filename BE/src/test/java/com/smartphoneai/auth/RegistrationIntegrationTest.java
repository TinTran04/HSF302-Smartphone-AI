package com.smartphoneai.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;
import java.util.concurrent.atomic.AtomicReference;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:registration;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class RegistrationIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @MockitoBean OtpSender sender;

    @Test void csrfTokenCanBeObtainedBeforeRegistering() throws Exception {
        var result = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty()).andReturn();
        var cookie = result.getResponse().getCookie("XSRF-TOKEN");
        org.junit.jupiter.api.Assertions.assertNotNull(cookie);
        mvc.perform(post("/api/auth/register").cookie(cookie).header("X-XSRF-TOKEN", cookie.getValue())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"csrf@example.com\",\"password\":\"Goodpass123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted());
    }

    @Test void resendDuringCooldownIsRejected() throws Exception {
        var registration = mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"cooldown@example.com\",\"password\":\"Goodpass123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String id = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/otp/resend").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("challengeId", id))))
                .andExpect(status().isTooManyRequests());
    }

    @Test void customerCanResetPasswordWithEmailOtp() throws Exception {
        var sent = new AtomicReference<String>();
        doAnswer(inv -> { sent.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var registration = mvc.perform(post("/api/auth/register").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"reset@example.com\",\"password\":\"Oldpassword123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String id = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/otp/verify").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("challengeId", id, "code", sent.get()))))
                .andExpect(status().isOk());
        var reset = mvc.perform(post("/api/auth/password-reset").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"reset@example.com\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String resetId = mapper.readTree(reset.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/password-reset/confirm").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("challengeId", resetId, "code", sent.get(), "newPassword", "Newpassword123!"))))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"reset@example.com\",\"password\":\"Oldpassword123!\"}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"reset@example.com\",\"password\":\"Newpassword123!\"}"))
                .andExpect(status().isAccepted());
    }

    @Test void unknownEmailGetsSameResetResponseWithoutSendingMail() throws Exception {
        var reset = mvc.perform(post("/api/auth/password-reset").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"unknown@example.com\"}"))
                .andExpect(status().isAccepted()).andExpect(jsonPath("$.challengeId").isNotEmpty()).andReturn();
        String resetId = mapper.readTree(reset.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(post("/api/auth/password-reset/confirm").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(java.util.Map.of("challengeId", resetId, "code", "123456", "newPassword", "Newpassword123!"))))
                .andExpect(status().isConflict());
        verifyNoInteractions(sender);
    }

    @Test void registrationActivatesOnlyAfterCorrectOtpAndCreatesSession() throws Exception {
        var sent = new AtomicReference<String>();
        doAnswer(inv -> { sent.set(inv.getArgument(1)); return null; }).when(sender).send(anyString(), anyString());
        var session = new MockHttpSession();
        var registration = mvc.perform(post("/api/auth/register").session(session).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"customer@example.com\",\"password\":\"Goodpass123!\",\"fullName\":\"An\",\"phone\":\"0900000000\"}"))
                .andExpect(status().isAccepted()).andReturn();
        String id = mapper.readTree(registration.getResponse().getContentAsString()).path("challengeId").asText();
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isUnauthorized());
        String wrongCode = sent.get().equals("000000") ? "111111" : "000000";
        String wrongBody = mapper.writeValueAsString(java.util.Map.of("challengeId", id, "code", wrongCode));
        mvc.perform(post("/api/auth/otp/verify").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(wrongBody))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/users/me").session(session)).andExpect(status().isUnauthorized());
        String body = mapper.writeValueAsString(java.util.Map.of("challengeId", id, "code", sent.get()));
        mvc.perform(post("/api/auth/otp/verify").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value("customer@example.com"));
        mvc.perform(get("/api/users/me").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("customer@example.com"));
        mvc.perform(put("/api/users/me").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"An Nguyen\",\"phone\":\"0912345678\",\"address\":\"123 Nguyen Hue\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.fullName").value("An Nguyen"));
        mvc.perform(get("/api/users/me").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.address").value("123 Nguyen Hue"));
        mvc.perform(post("/api/auth/otp/verify").session(session).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());

        mvc.perform(post("/api/auth/logout").session(session).with(csrf())).andExpect(status().isNoContent());
        var login = mvc.perform(post("/api/auth/login").with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"customer@example.com\",\"password\":\"Goodpass123!\"}"))
                .andExpect(status().isAccepted()).andReturn();
        var loginSession = new MockHttpSession();
        mvc.perform(get("/api/users/me").session(loginSession)).andExpect(status().isUnauthorized());
        String loginId = mapper.readTree(login.getResponse().getContentAsString()).path("challengeId").asText();
        String loginBody = mapper.writeValueAsString(java.util.Map.of("challengeId", loginId, "code", sent.get()));
        mvc.perform(post("/api/auth/otp/verify").session(loginSession).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.email").value("customer@example.com"));
        mvc.perform(get("/api/users/me").session(loginSession)).andExpect(status().isOk());
    }
}
