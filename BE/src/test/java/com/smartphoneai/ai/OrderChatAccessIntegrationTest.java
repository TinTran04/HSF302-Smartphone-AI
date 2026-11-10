package com.smartphoneai.ai;

import com.smartphoneai.entity.OrderPreview;
import com.smartphoneai.entity.OrderRecord;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.OrderPreviewRepository;
import com.smartphoneai.repository.OrderRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.impl.OrderChatLookup;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.time.Instant;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class OrderChatAccessIntegrationTest {
    @Autowired OrderRepository orders;
    @Autowired OrderPreviewRepository previews;
    @Autowired UserAccountRepository users;

    @Test void customerCannotReadAnotherCustomersOrderEvenWithTheExactId() {
        var owner = users.saveAndFlush(UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Owner", "0900000000", "x"));
        var other = users.saveAndFlush(UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "Other", "0900000001", "x"));
        var preview = previews.saveAndFlush(new OrderPreview(owner.getId(), "Owner", "0900000000", "address", "", Instant.now().plusSeconds(600)));
        var order = orders.saveAndFlush(new OrderRecord(owner.getId(), preview, UUID.randomUUID().toString(), 1000000, Instant.now()));
        var lookup = new OrderChatLookup(orders);
        assertTrue(lookup.answer(owner.getId(), order.getId().toString()).contains("Chờ xác nhận"));
        String answer = lookup.answer(other.getId(), order.getId().toString());
        assertTrue(answer.contains("Không tìm thấy"));
        assertFalse(answer.contains("Chờ xác nhận"));
    }
}
