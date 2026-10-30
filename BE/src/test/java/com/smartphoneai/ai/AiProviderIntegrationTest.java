package com.smartphoneai.ai;

import com.smartphoneai.service.ChatProviderClient;
import com.smartphoneai.service.OtpSender;
import com.smartphoneai.repository.AiProviderConfigRepository;
import com.smartphoneai.exception.AiProviderException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:aiprovider;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=aiadmin", "app.root-admin.password=TestRootPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
class AiProviderIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired AiProviderConfigRepository configs;
    @MockitoBean OtpSender otpSender;
    @MockitoBean ChatProviderClient provider;
    @Test void onlySuccessfullyTestedConfigurationCanBeActivatedWithoutReturningSecret() throws Exception {
        var session = new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"aiadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        mvc.perform(put("/api/admin/ai-settings").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\",\"model\":\"demo-model\",\"apiKey\":\"secret-key-123\"}"))
                .andExpect(status().isOk()).andExpect(content().string(not(containsString("secret-key-123"))));
        org.junit.jupiter.api.Assertions.assertFalse(configs.findFirstByProviderOrderByIdDesc("OPENAI").orElseThrow().getKeyCipher().contains("secret-key-123"));
        mvc.perform(post("/api/admin/ai-settings/activate").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\"}")).andExpect(status().isConflict());
        when(provider.chat(eq("OPENAI"), eq("demo-model"), eq("secret-key-123"), anyString())).thenReturn("OK");
        mvc.perform(post("/api/admin/ai-settings/test").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\",\"model\":\"demo-model\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/admin/ai-settings/activate").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\"}")).andExpect(status().isOk());
        mvc.perform(get("/api/admin/ai-settings").session(session)).andExpect(status().isOk())
                .andExpect(content().string(not(containsString("secret-key-123"))));
        mvc.perform(put("/api/admin/ai-settings").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"bad-model\",\"apiKey\":\"bad-key\"}"))
                .andExpect(status().isOk());
        when(provider.chat(eq("GEMINI"), eq("bad-model"), eq("bad-key"), anyString())).thenThrow(new AiProviderException());
        mvc.perform(post("/api/admin/ai-settings/test").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\",\"model\":\"bad-model\"}")).andExpect(status().isServiceUnavailable());
        mvc.perform(post("/api/admin/ai-settings/activate").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"GEMINI\"}")).andExpect(status().isConflict());
        org.junit.jupiter.api.Assertions.assertEquals("OPENAI", configs.findAllByActiveTrue().getFirst().getProvider());
    }
}
