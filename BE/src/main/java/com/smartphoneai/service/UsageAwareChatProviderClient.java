package com.smartphoneai.service;

public interface UsageAwareChatProviderClient extends ChatProviderClient {
    record Reply(String text, Integer inputTokens, Long tokensPerMinute, Integer totalTokens, Long requestsPerDay) {
        public Reply(String text, Integer inputTokens) { this(text, inputTokens, null, null, null); }
        public Reply(String text, Integer inputTokens, Long tokensPerMinute) { this(text, inputTokens, tokensPerMinute, null, null); }
        public Reply(String text, Integer inputTokens, Long tokensPerMinute, Integer totalTokens) {
            this(text, inputTokens, tokensPerMinute, totalTokens, null);
        }
    }
    Reply chatWithUsage(String provider, String model, String apiKey, String prompt);
}
