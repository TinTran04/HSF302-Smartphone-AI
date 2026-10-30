package com.smartphoneai.service;

public interface OtpSender {
    void send(String email, String code);
}
