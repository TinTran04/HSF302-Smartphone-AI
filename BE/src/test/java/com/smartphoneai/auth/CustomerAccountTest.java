package com.smartphoneai.auth;

import com.smartphoneai.entity.UserAccount;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CustomerAccountTest {
    @Test void newCustomerRequiresEmailVerificationBeforeActivation() {
        var customer = UserAccount.pendingCustomer("USER@EXAMPLE.COM", "An", "0900000000", "hash");
        assertEquals("user@example.com", customer.getEmail());
        assertEquals(UserAccount.Role.CUSTOMER, customer.getRole());
        assertFalse(customer.isActive());
        customer.activate();
        assertTrue(customer.isActive());
    }
}
