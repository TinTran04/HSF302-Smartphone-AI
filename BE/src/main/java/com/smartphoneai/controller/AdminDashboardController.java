package com.smartphoneai.controller;

import com.smartphoneai.entity.OrderStatus;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import com.smartphoneai.repository.OrderRepository;
import com.smartphoneai.repository.ProductRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final ProductRepository products;
    private final OrderRepository orders;
    private final KnowledgeDocumentRepository documents;

    public AdminDashboardController(ProductRepository products, OrderRepository orders, KnowledgeDocumentRepository documents) {
        this.products = products; this.orders = orders; this.documents = documents;
    }

    public record Dashboard(long products, long orders, long pendingOrders, long completedOrders,
                            long readyDocuments, long processingDocuments) {}

    @GetMapping
    @Transactional(readOnly = true)
    public Dashboard get() {
        return new Dashboard(products.count(), orders.count(), orders.countByStatus(OrderStatus.PENDING),
                orders.countByStatus(OrderStatus.COMPLETED), documents.countByStatus("READY"),
                documents.countByStatus("PROCESSING"));
    }
}
