package com.smartphoneai.order;

import com.smartphoneai.dto.response.OrderResponse;
import com.smartphoneai.entity.OrderPreview;
import com.smartphoneai.entity.OrderRecord;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.OrderRepository;
import com.smartphoneai.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class OrderListIntegrationTest {
    @Autowired OrderRepository orders;
    @Autowired TestEntityManager entityManager;

    @Test void customerListsNewestFirstAndBreaksTiesByDescendingId() {
        var userId = user();
        save(userId, "00000000-0000-0000-0000-000000000001", "2026-01-01T00:00:00Z");
        save(userId, "00000000-0000-0000-0000-000000000002", "2026-01-02T00:00:00Z");
        save(userId, "00000000-0000-0000-0000-000000000003", "2026-01-02T00:00:00Z");
        save(user(), "00000000-0000-0000-0000-000000000004", "2026-01-03T00:00:00Z");
        entityManager.flush(); entityManager.clear();

        assertEquals(List.of("00000000-0000-0000-0000-000000000003",
                        "00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000001"),
                service().list(userId).stream().map(OrderResponse::id).toList());
    }

    @Test void adminListsNewestFirstAndBreaksTiesByDescendingId() {
        var userId = user();
        save(userId, "00000000-0000-0000-0000-000000000001", "2026-01-01T00:00:00Z");
        save(userId, "00000000-0000-0000-0000-000000000003", "2026-01-02T00:00:00Z");
        save(user(), "00000000-0000-0000-0000-000000000002", "2026-01-02T00:00:00Z");
        entityManager.flush(); entityManager.clear();

        assertEquals(List.of("00000000-0000-0000-0000-000000000003",
                        "00000000-0000-0000-0000-000000000002", "00000000-0000-0000-0000-000000000001"),
                service().listAdmin().stream().map(OrderResponse::id).toList());
    }

    private OrderServiceImpl service() {
        return new OrderServiceImpl(null, null, null, null, null, orders, Clock.systemUTC());
    }

    private UUID user() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "An", "0900000000", "hash");
        entityManager.persist(user);
        return user.getId();
    }

    private void save(UUID userId, String id, String createdAt) {
        var time = Instant.parse(createdAt);
        var preview = new OrderPreview(userId, "An", "0900000000", "123 Nguyen Hue", "", time.plusSeconds(900));
        entityManager.persist(preview);
        var order = new OrderRecord(userId, preview, id, 100, time);
        ReflectionTestUtils.setField(order, "id", UUID.fromString(id));
        entityManager.persist(order);
    }
}
