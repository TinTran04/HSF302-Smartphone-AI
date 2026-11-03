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
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(GmailAdminInvitationSender.class);

    @Override public void send(String email, String token) {
        String link = inviteUrl + "?token=" + token;
        if (sender.isBlank()) {
            log.info("================================================================================");
            log.info("[ADMIN INVITATION SENDER] Gui loi moi quan tri den {}: >>> {} <<< (Chua cau hinh SMTP_USERNAME)", email, link);
            log.info("================================================================================");
            return;
        }
        var message = new SimpleMailMessage();
        message.setFrom(sender); message.setTo(email); message.setSubject("Lời mời quản trị SmartPhone AI");
        message.setText("Đặt mật khẩu trong 24 giờ: " + link);
        mail.send(message);
    }
}
