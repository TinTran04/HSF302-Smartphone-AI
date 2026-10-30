package com.smartphoneai.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.smartphoneai.entity.Product;
import com.smartphoneai.entity.KnowledgeDocument;
import com.smartphoneai.repository.ProductRepository;
import com.smartphoneai.repository.KnowledgeDocumentRepository;
import java.time.Instant;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:dashboardtest;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
class DashboardIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ProductRepository products;
    @Autowired KnowledgeDocumentRepository documents;

    @Test void dashboardRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());
    }

    @Test @WithMockUser(roles = "CUSTOMER")
    void customerCannotViewDashboard() throws Exception {
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isForbidden());
    }

    @Test @WithMockUser(roles = "ADMIN")
    void dashboardContainsAllCounters() throws Exception {
        var product = new Product(); product.setName("Dashboard product"); product.setActive(true);
        products.saveAndFlush(product);
        var ready = new KnowledgeDocument("ready.txt", 1, "[]", Instant.now());
        ready.ready("v1"); documents.saveAndFlush(ready);
        documents.saveAndFlush(new KnowledgeDocument("processing.txt", 1, "[]", Instant.now()));
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isOk())
                .andExpect(jsonPath("$.products").value(1))
                .andExpect(jsonPath("$.orders").value(0))
                .andExpect(jsonPath("$.pendingOrders").value(0))
                .andExpect(jsonPath("$.completedOrders").value(0))
                .andExpect(jsonPath("$.readyDocuments").value(1))
                .andExpect(jsonPath("$.processingDocuments").value(1));
    }
}
