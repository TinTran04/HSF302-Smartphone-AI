package com.smartphoneai.service.impl;

import org.springframework.stereotype.Component;

@Component
public class AiChatMetrics {
    private long requests, failures, totalMillis;
    public record Snapshot(long requests, long failures, long averageMillis) {}
    public synchronized void record(long millis, boolean success) {
        requests++;
        if (!success) failures++;
        totalMillis += Math.max(0, millis);
    }
    public synchronized Snapshot snapshot() {
        return new Snapshot(requests, failures, requests == 0 ? 0 : totalMillis / requests);
    }
}
