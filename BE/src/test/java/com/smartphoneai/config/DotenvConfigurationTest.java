package com.smartphoneai.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;
import static org.junit.jupiter.api.Assertions.*;

class DotenvConfigurationTest {
    @TempDir Path temporaryDirectory;

    @TestConfiguration(proxyBeanMethods = false)
    static class ConfigurationProbe {}

    @Test void loadsDatabaseMailAdminAndEncryptionFromDotenv() throws Exception {
        var file = temporaryDirectory.resolve(".env");
        Files.writeString(file, """
                DB_URL=jdbc:postgresql://localhost:5432/dotenv_test
                DB_USERNAME=dotenv_user
                DB_PASSWORD=db!#=password
                SMTP_USERNAME=sender@example.com
                SMTP_PASSWORD=mail!#=password
                SMTP_LOCALHOST=localhost
                ROOT_ADMIN_USERNAME=dotenv_admin
                ROOT_ADMIN_PASSWORD=AdminPassword123!
                AI_CONFIG_ENCRYPTION_KEY=test-only-key
                """);
        try (var context = load(file, Map.of())) {
            var environment = context.getEnvironment();
            assertEquals("jdbc:postgresql://localhost:5432/dotenv_test", environment.getProperty("spring.datasource.url"));
            assertEquals("dotenv_user", environment.getProperty("spring.datasource.username"));
            assertEquals("db!#=password", environment.getProperty("spring.datasource.password"));
            assertEquals("sender@example.com", environment.getProperty("spring.mail.username"));
            assertEquals("mail!#=password", environment.getProperty("spring.mail.password"));
            assertEquals("dotenv_admin", environment.getProperty("app.root-admin.username"));
            assertEquals("AdminPassword123!", environment.getProperty("app.root-admin.password"));
            assertEquals("test-only-key", environment.getProperty("app.ai.encryption-key"));
        }
    }

    @Test void systemEnvironmentKeepsPriorityOverDotenv() throws Exception {
        var file = temporaryDirectory.resolve(".env");
        Files.writeString(file, "SMTP_USERNAME=from-file@example.com\n");
        try (var context = load(file, Map.of("SMTP_USERNAME", "from-environment@example.com"))) {
            assertEquals("from-environment@example.com", context.getEnvironment().getProperty("spring.mail.username"));
        }
    }

    @Test void missingOptionalDotenvKeepsExistingDefaults() {
        try (var context = load(temporaryDirectory.resolve("missing.env"), Map.of())) {
            assertEquals("jdbc:postgresql://localhost:5432/smartphone_ai", context.getEnvironment().getProperty("spring.datasource.url"));
            assertEquals("", context.getEnvironment().getProperty("spring.mail.username"));
        }
    }

    private ConfigurableApplicationContext load(Path file, Map<String, Object> systemValues) {
        var environment = new StandardEnvironment();
        environment.getPropertySources().remove(StandardEnvironment.SYSTEM_PROPERTIES_PROPERTY_SOURCE_NAME);
        environment.getPropertySources().remove(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME);
        environment.getPropertySources().addFirst(new MapPropertySource("systemEnvironment", systemValues));
        var application = new SpringApplication(ConfigurationProbe.class);
        application.setEnvironment(environment);
        application.setWebApplicationType(WebApplicationType.NONE);
        application.setBannerMode(Banner.Mode.OFF);
        application.setLogStartupInfo(false);
        return application.run("--spring.config.location=classpath:application.yml",
                "--APP_ENV_FILE=optional:" + file.toUri() + "[.properties]");
    }
}
