package com.smartphoneai.knowledge;

import com.smartphoneai.entity.KnowledgeDocument;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class KnowledgeDocumentStatusTest {
    @Test void enablingAnAlreadyEnabledDocumentDoesNotInterruptProcessing() {
        var document = new KnowledgeDocument("example.txt", 1, "[]", Instant.now());
        document.setEnabled(true);
        assertEquals("PROCESSING", document.getStatus());
    }
}
