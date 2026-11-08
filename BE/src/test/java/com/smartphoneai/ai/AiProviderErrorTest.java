package com.smartphoneai.ai;

import com.smartphoneai.exception.AiProviderException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AiProviderErrorTest {
    @Test void overloadAndInvalidKeyHaveSafeActionableMessages() {
        var busy = new AiProviderException(503);
        assertEquals("AI_PROVIDER_BUSY", busy.getCode());
        assertTrue(busy.getMessage().contains("quá tải"));
        assertEquals("AI_PROVIDER_AUTH_ERROR", new AiProviderException(401).getCode());
        assertEquals("AI_PROVIDER_MODEL_ERROR", new AiProviderException(404).getCode());
    }
}
