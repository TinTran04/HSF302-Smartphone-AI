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
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GmailOtpSender.class);
    @Override public void send(String email, String code) {
        if (sender.isBlank()) {
            log.info("================================================================================");
            log.info("[OTP CONSOLE SENDER] Gui ma OTP den {}: >>> {} <<< (Chua cau hinh SMTP_USERNAME)", email, code);
            log.info("================================================================================");
            return;
        }
        var message = new SimpleMailMessage();
        message.setFrom(sender);
        message.setTo(email);
        message.setSubject("Mã xác minh SmartPhone AI");
        message.setText("Mã xác minh của bạn là: " + code + ". Mã có hiệu lực trong 5 phút.");
        mail.send(message);
    }
}
