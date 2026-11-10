package com.smartphoneai.ai;

import com.smartphoneai.entity.OrderRecord;
import com.smartphoneai.entity.OrderStatus;
import com.smartphoneai.repository.OrderRepository;
import com.smartphoneai.service.impl.OrderChatLookup;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OrderChatLookupTest {
    @Test void aSpecifiedOrderIsLookedUpOnlyForTheAuthenticatedOwner() {
        var repo = mock(OrderRepository.class);
        UUID user = UUID.randomUUID(), id = UUID.randomUUID();
        when(repo.findByIdAndUserId(id, user)).thenReturn(Optional.empty());
        String answer = new OrderChatLookup(repo).answer(user, "Đơn hàng " + id);
        assertTrue(answer.contains("Không tìm thấy"));
        verify(repo).findByIdAndUserId(id, user);
        verify(repo, never()).findById(any());
    }

    @Test void multipleOrdersAskTheCustomerToChooseWithoutInventingDeliveryLocation() {
        var repo = mock(OrderRepository.class);
        var first = mock(OrderRecord.class);
        var second = mock(OrderRecord.class);
        when(first.getId()).thenReturn(UUID.randomUUID());
        when(second.getId()).thenReturn(UUID.randomUUID());
        when(first.getStatus()).thenReturn(OrderStatus.SHIPPING);
        when(second.getStatus()).thenReturn(OrderStatus.PENDING);
        UUID user = UUID.randomUUID();
        when(repo.findAllByUserIdOrderByCreatedAtDescIdDesc(user)).thenReturn(List.of(first, second));
        String answer = new OrderChatLookup(repo).answer(user, "Đơn hàng của tôi đang ở đâu?");
        assertTrue(answer.contains("chọn"));
        assertFalse(answer.contains("vị trí hiện tại"));
    }
}
