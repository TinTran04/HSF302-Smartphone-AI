package com.smartphoneai.controller;

import com.smartphoneai.service.impl.AiChatMetrics;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai-settings/metrics")
public class AiMetricsController {
    private final AiChatMetrics metrics;
    public AiMetricsController(AiChatMetrics metrics) { this.metrics = metrics; }
    @GetMapping public AiChatMetrics.Snapshot snapshot() { return metrics.snapshot(); }
}
