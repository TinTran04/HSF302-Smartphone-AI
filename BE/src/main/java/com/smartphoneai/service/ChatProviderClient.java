package com.smartphoneai.service;

public interface ChatProviderClient {
    String chat(String provider, String model, String apiKey, String prompt);
}
