package com.smartphoneai.architecture;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:servicecontracts;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
class ServiceLayerStructureTest {
    @Autowired ApplicationContext context;

    @ParameterizedTest
    @ValueSource(strings = {
            "AdminManagementService", "AdminProductService", "AiModelCatalogService", "AiChatService", "AiProviderService",
            "BrandService", "CartService", "ChatResponder", "DocumentProcessingService",
            "EmbeddingSettingsService", "GuestSessionCleanup", "KnowledgeIndexWorker", "KnowledgeService",
            "LoginService", "MaintenanceService", "OrderService", "OtpChallengeService",
            "PasswordResetService", "PhoneAssistanceService", "ProductService", "RagService",
            "RegistrationService", "TopicRouter", "UserService"
    })
    void serviceContractHasOneInjectableImplementation(String name) throws Exception {
        Class<?> contract = Class.forName("com.smartphoneai.service." + name);
        assertTrue(contract.isInterface(), name + " must expose a service interface");
        var beans = context.getBeansOfType(contract);
        assertEquals(1, beans.size(), "Each service contract must have exactly one implementation");
        assertEquals("com.smartphoneai.service.impl." + name + "Impl",
                AopUtils.getTargetClass(beans.values().iterator().next()).getName());
    }
}
