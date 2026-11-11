package com.smartphoneai.ai;

import com.smartphoneai.service.impl.AiChatMetrics;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AiChatMetricsTest {
    @Test void countsRequestsFailuresAndAverageDurationWithoutSavingMessages() {
        var metrics = new AiChatMetrics();
        metrics.record(100, true);
        metrics.record(300, false);
        var snapshot = metrics.snapshot();
        assertEquals(2, snapshot.requests());
        assertEquals(1, snapshot.failures());
        assertEquals(200, snapshot.averageMillis());
    }
}
