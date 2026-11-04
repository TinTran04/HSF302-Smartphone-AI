package com.smartphoneai.auth;

import com.smartphoneai.service.impl.GmailAdminInvitationSender;
import com.smartphoneai.service.impl.GmailOtpSender;
import com.smartphoneai.exception.EmailDeliveryException;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSender;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class MailSenderConfigurationTest {
    @Test void missingSmtpDoesNotPretendToSendOtpOrInvitation() {
        var mail = mock(JavaMailSender.class);
        assertThrows(EmailDeliveryException.class, () -> new GmailOtpSender(mail, "").send("user@example.com", "123456"));
        assertThrows(EmailDeliveryException.class, () -> new GmailAdminInvitationSender(mail, "", "http://localhost/invite").send("user@example.com", "token"));
        verifyNoInteractions(mail);
    }
}
