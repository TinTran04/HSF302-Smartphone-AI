package com.smartphoneai.ai;

import com.smartphoneai.exception.AiProviderException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AiProviderErrorTest {
    @Test void explicitExpiredOrInvalidKeyResponsesAllowFallbackWithoutExposingProviderDetails() {
        for (String detail : new String[]{"API key expired. Please renew the API key.", "API key not valid. secret-key",
                "API_KEY_INVALID", "API_KEY_EXPIRED"}) {
            var error = AiProviderException.fromProvider(400, detail);
            assertTrue(error.isKeyFailure());
            assertEquals("AI_PROVIDER_AUTH_ERROR", error.getCode());
            assertFalse(error.getMessage().contains("secret-key"));
        }
        assertFalse(AiProviderException.fromProvider(400, "Invalid request payload").isKeyFailure());
        assertFalse(AiProviderException.fromProvider(400, null).isKeyFailure());
    }
    @Test void overloadAndInvalidKeyHaveSafeActionableMessages() {
        var busy = new AiProviderException(503);
        assertEquals("AI_PROVIDER_BUSY", busy.getCode());
        assertTrue(busy.getMessage().contains("quá tải"));
        assertEquals("AI_PROVIDER_AUTH_ERROR", new AiProviderException(401).getCode());
        assertEquals("AI_PROVIDER_MODEL_ERROR", new AiProviderException(404).getCode());
    }
    @Test void deepSeekInsufficientBalanceIsTreatedAsQuotaSoBackupKeysAreTried() {
        var error = AiProviderException.fromProvider(402, "{\"error\":{\"message\":\"Insufficient Balance\"}}");
        assertTrue(error.isKeyFailure());
        assertTrue(error.isQuotaExceeded());
        assertEquals("AI_PROVIDER_RATE_LIMIT", error.getCode());
    }
}
