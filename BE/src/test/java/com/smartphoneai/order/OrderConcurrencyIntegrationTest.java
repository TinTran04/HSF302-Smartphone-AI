package com.smartphoneai.order;

import com.smartphoneai.dto.request.*;
import com.smartphoneai.entity.*;
import com.smartphoneai.repository.*;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.OrderService;
import com.smartphoneai.service.OtpSender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:orderconcurrency;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password="})
class OrderConcurrencyIntegrationTest {
    @Autowired UserAccountRepository users;
    @Autowired ProductRepository products;
    @Autowired CartService cart;
    @Autowired OrderService orders;
    @Autowired OrderRepository orderRepository;
    @MockitoBean OtpSender sender;

    @Test void simultaneousRequestsWithSameKeyCreateOneOrder() throws Exception {
        var user=UserAccount.pendingCustomer("race@example.com","An","0900000000","hash"); user.activate(); users.saveAndFlush(user);
        var product=new Product(); product.setName("Demo"); product.setActive(true);
        var variant=new ProductVariant(); variant.setColor("Black"); variant.setStorage("128GB"); variant.setPrice(10000000L); variant.setActive(true);
        product.addVariant(variant); products.saveAndFlush(product);
        cart.add(user.getId(),variant.getId(),1);
        var shipping=new ShippingInfo("An","0900000000","123 Nguyen Hue","");
        var preview=orders.preview(user.getId(),new OrderPreviewRequest(List.of(variant.getId()),shipping,"COD"));
        var request=new PlaceOrderRequest(UUID.fromString(preview.previewId()),shipping,"COD");
        var barrier=new CyclicBarrier(2);
        try (var executor=Executors.newFixedThreadPool(2)) {
            Callable<String> task=() -> { barrier.await(5,TimeUnit.SECONDS); return orders.place(user.getId(),"same-key",request).id(); };
            var one=executor.submit(task); var two=executor.submit(task);
            assertEquals(one.get(15,TimeUnit.SECONDS),two.get(15,TimeUnit.SECONDS));
        }
        assertEquals(1,orderRepository.count());
    }
}
