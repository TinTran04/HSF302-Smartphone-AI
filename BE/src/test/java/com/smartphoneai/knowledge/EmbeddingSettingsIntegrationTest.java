package com.smartphoneai.knowledge;

import com.smartphoneai.repository.EmbeddingConfigRepository;
import com.smartphoneai.service.EmbeddingModelFactory;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:embedding;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=",
        "app.root-admin.username=embedadmin", "app.root-admin.password=TestRootPassword123!",
        "app.ai.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc
class EmbeddingSettingsIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired EmbeddingConfigRepository configs;
    @MockitoBean OtpSender sender;
    @MockitoBean EmbeddingModelFactory factory;
    @Test void verifiesEmbeddingAndKeepsSecretsEncrypted() throws Exception {
        var model=mock(EmbeddingModel.class);
        when(factory.create(eq("OPENAI"),eq("embed-model"),eq("embedding-secret"),eq(3),eq(false))).thenReturn(model);
        when(model.embed(anyString())).thenReturn(new float[]{0.1f,0.2f,0.3f});
        var session=new MockHttpSession();
        mvc.perform(post("/api/auth/login").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"embedadmin\",\"password\":\"TestRootPassword123!\"}")).andExpect(status().isOk());
        mvc.perform(put("/api/admin/embedding-settings").session(session).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"provider\":\"OPENAI\",\"model\":\"embed-model\",\"apiKey\":\"embedding-secret\",\"dimensions\":3}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.configured").value(true))
                .andExpect(content().string(not(containsString("embedding-secret"))));
        org.junit.jupiter.api.Assertions.assertFalse(configs.findByActiveTrue().orElseThrow().getKeyCipher().contains("embedding-secret"));
    }
}
