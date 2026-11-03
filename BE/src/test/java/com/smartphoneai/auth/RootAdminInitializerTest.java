package com.smartphoneai.auth;

import com.smartphoneai.config.RootAdminInitializer;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.mockito.Mockito.*;

class RootAdminInitializerTest {
    @Test void startupDoesNotOverwriteExistingRootPassword() {
        var users = mock(UserAccountRepository.class);
        var passwords = mock(PasswordEncoder.class);
        var root = UserAccount.rootAdmin("root", "existing-hash");
        when(users.findByRootKey("ROOT")).thenReturn(Optional.of(root));
        when(users.existsByRootKey("ROOT")).thenReturn(true);
        new RootAdminInitializer(users, passwords, "root", "new-configured-password").run(null);
        verifyNoInteractions(passwords);
        verify(users, never()).saveAndFlush(any());
    }
}
