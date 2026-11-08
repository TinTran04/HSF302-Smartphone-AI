package com.smartphoneai.service.impl;

import com.smartphoneai.service.AdminInvitationSender;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.mail.MailException;
import com.smartphoneai.exception.EmailDeliveryException;

@Component
public class GmailAdminInvitationSender implements AdminInvitationSender {
    private final JavaMailSender mail;
    private final String sender;
    private final String inviteUrl;
    public GmailAdminInvitationSender(JavaMailSender mail, @Value("${spring.mail.username:}") String sender,
            @Value("${app.account-invitation-url:${app.admin-invitation-url:http://localhost:5173/account/invite}}") String inviteUrl) {
        this.mail = mail; this.sender = sender; this.inviteUrl = inviteUrl;
    }
    @Override public void send(String email, String token) {
        String link = inviteUrl + "?token=" + token;
        if (sender.isBlank()) throw new EmailDeliveryException("Hệ thống chưa cấu hình email gửi lời mời. Vui lòng liên hệ quản trị viên.");
        var message = new SimpleMailMessage();
        message.setFrom(sender); message.setTo(email); message.setSubject("Kích hoạt tài khoản SmartPhone AI");
        message.setText("Quản trị viên đã tạo tài khoản SmartPhone AI cho bạn.\n"
                + "Mở liên kết sau để tự đặt mật khẩu và kích hoạt tài khoản trong 24 giờ.\n" + link);
        try {
            mail.send(message);
        } catch (MailException exception) {
            throw new EmailDeliveryException(exception);
        }
    }
}
