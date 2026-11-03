package com.smartphoneai.auth;

import com.smartphoneai.service.GmailAdminInvitationSender;
import com.smartphoneai.service.GmailOtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class MailSenderConfigurationTest {
    @Test void missingSmtpDoesNotPretendToSendOtpOrInvitation() {
        var mail = mock(JavaMailSender.class);
        assertThrows(IllegalStateException.class, () -> new GmailOtpSender(mail, "").send("user@example.com", "123456"));
        assertThrows(IllegalStateException.class, () -> new GmailAdminInvitationSender(mail, "", "http://localhost/invite").send("user@example.com", "token"));
        verifyNoInteractions(mail);
    }
}
