package com.smartphoneai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class GmailAdminInvitationSender implements AdminInvitationSender {
    private final JavaMailSender mail;
    private final String sender;
    private final String inviteUrl;
    public GmailAdminInvitationSender(JavaMailSender mail, @Value("${spring.mail.username:}") String sender,
            @Value("${app.admin-invitation-url:http://localhost:5173/admin/invite}") String inviteUrl) {
        this.mail = mail; this.sender = sender; this.inviteUrl = inviteUrl;
    }
    @Override public void send(String email, String token) {
        if (sender.isBlank()) throw new IllegalStateException("SMTP username is not configured");
        var message = new SimpleMailMessage();
        message.setFrom(sender); message.setTo(email); message.setSubject("Lời mời quản trị SmartPhone AI");
        message.setText("Đặt mật khẩu trong 24 giờ: " + inviteUrl + "?token=" + token);
        mail.send(message);
    }
}
