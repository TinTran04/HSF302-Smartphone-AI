package com.smartphoneai.auth;

import com.smartphoneai.config.RootAdminInitializer;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import java.util.Optional;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RootAdminInitializerTest {
    private final ValidatorFactory validators = Validation.buildDefaultValidatorFactory();

    @AfterEach void closeValidators() { validators.close(); }

    @Test void startupDoesNotOverwriteExistingRootPassword() {
        var users = mock(UserAccountRepository.class);
        var passwords = mock(PasswordEncoder.class);
        var root = UserAccount.rootAdmin("old@example.com", "existing-hash");
        when(users.findByRootKey("ROOT")).thenReturn(Optional.of(root));
        when(users.existsByRootKey("ROOT")).thenReturn(true);
        new RootAdminInitializer(users, passwords, validators.getValidator(), "new@example.com", "new-configured-password").run(null);
        assertEquals("old@example.com", root.getEmail());
        assertEquals("existing-hash", root.getPasswordHash());
        verifyNoInteractions(passwords);
        verify(users, never()).saveAndFlush(any());
    }

    @Test void legacyRootGetsEmailWithoutReplacingItsIdentityOrPassword() {
        var users = mock(UserAccountRepository.class);
        var passwords = mock(PasswordEncoder.class);
        var root = UserAccount.rootAdmin("legacy@example.com", "existing-hash");
        ReflectionTestUtils.setField(root, "email", null);
        ReflectionTestUtils.setField(root, "username", "legacy-root");
        var id = root.getId();
        when(users.findByRootKey("ROOT")).thenReturn(Optional.of(root));
        when(users.findByEmail("owner@example.com")).thenReturn(Optional.empty());
        new RootAdminInitializer(users, passwords, validators.getValidator(), " OWNER@EXAMPLE.COM ", "").run(null);
        assertEquals(id, root.getId());
        assertEquals("owner@example.com", root.getEmail());
        assertNull(root.getUsername());
        assertEquals("existing-hash", root.getPasswordHash());
        assertTrue(root.isRoot());
        verifyNoInteractions(passwords);
        verify(users, never()).save(any(UserAccount.class));
    }

    @Test void legacyRootCannotTakeAnotherAccountsEmail() {
        var users = mock(UserAccountRepository.class);
        var passwords = mock(PasswordEncoder.class);
        var root = UserAccount.rootAdmin("legacy@example.com", "existing-hash");
        ReflectionTestUtils.setField(root, "email", null);
        var customer = UserAccount.pendingCustomer("used@example.com", "Customer", "", "customer-hash");
        when(users.findByRootKey("ROOT")).thenReturn(Optional.of(root));
        when(users.findByEmail("used@example.com")).thenReturn(Optional.of(customer));
        var initializer = new RootAdminInitializer(users, passwords, validators.getValidator(), "used@example.com", "");
        assertThrows(IllegalStateException.class, () -> initializer.run(null));
        assertNull(root.getEmail());
        assertEquals("existing-hash", root.getPasswordHash());
        assertEquals(UserAccount.Role.CUSTOMER, customer.getRole());
        verifyNoInteractions(passwords);
    }

    @Test void usernameIsRejectedAsRootEmail() {
        var users = mock(UserAccountRepository.class);
        var passwords = mock(PasswordEncoder.class);
        when(users.findByRootKey("ROOT")).thenReturn(Optional.empty());
        var initializer = new RootAdminInitializer(users, passwords, validators.getValidator(), "admin123", "Password123!");
        assertThrows(IllegalStateException.class, () -> initializer.run(null));
        verifyNoInteractions(passwords);
    }
}
