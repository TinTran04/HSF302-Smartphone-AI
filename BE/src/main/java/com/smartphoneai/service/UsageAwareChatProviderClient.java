package com.smartphoneai.service;

public interface UsageAwareChatProviderClient extends ChatProviderClient {
    record Reply(String text, Integer inputTokens) {}
    Reply chatWithUsage(String provider, String model, String apiKey, String prompt);
}
