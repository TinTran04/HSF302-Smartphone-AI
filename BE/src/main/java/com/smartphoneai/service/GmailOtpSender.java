package com.smartphoneai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class GmailOtpSender implements OtpSender {
    private final JavaMailSender mail;
    private final String sender;
    public GmailOtpSender(JavaMailSender mail, @Value("${spring.mail.username:}") String sender) {
        this.mail = mail;
        this.sender = sender;
    }
    @Override public void send(String email, String code) {
        if (sender.isBlank()) throw new IllegalStateException("SMTP username is not configured");
        var message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(email);
        message.setSubject("Mã xác minh SmartPhone AI");
        message.setText("Mã xác minh của bạn là: " + code + ". Mã có hiệu lực trong 5 phút.");
        mail.send(message);
    }
}
