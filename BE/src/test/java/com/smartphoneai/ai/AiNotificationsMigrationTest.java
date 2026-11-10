package com.smartphoneai.ai;

import java.sql.DriverManager;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AiNotificationsMigrationTest {
    @Test void existingAlertsAndAdminCredentialsSurviveNotificationMigration() throws Exception {
        String url = "jdbc:h2:mem:notificationmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("30").load().migrate();
        var id = UUID.randomUUID();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            sql.execute("insert into ai_provider_configs(id,provider,model,key_cipher,active,created_at) "
                    + "values (101,'GEMINI','existing-model','cipher-primary',true,CURRENT_TIMESTAMP)");
            sql.execute("insert into ai_key_alerts(id,config_id,status,reason,detected_at) "
                    + "values (500,101,'USING_BACKUP','AI_PROVIDER_RATE_LIMIT',CURRENT_TIMESTAMP)");
            sql.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active,deleted,disabled,version,credential_version) "
                    + "values ('" + id + "','existing-admin@example.test','preserved-hash','Admin','','','ADMIN',true,false,false,7,3)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            try (var rows = sql.executeQuery("select id,status,reason,backup_key_name from ai_key_alerts where config_id=101")) {
                assertTrue(rows.next());
                assertEquals(500, rows.getLong(1));
                assertEquals("USING_BACKUP", rows.getString(2));
                assertEquals("AI_PROVIDER_RATE_LIMIT", rows.getString(3));
                assertNull(rows.getString(4));
            }
            try (var rows = sql.executeQuery("select password_hash,credential_version,version,ai_notifications_read_through_id "
                    + "from users where id='" + id + "'")) {
                assertTrue(rows.next());
                assertEquals("preserved-hash", rows.getString(1));
                assertEquals(3, rows.getLong(2));
                assertEquals(7, rows.getLong(3));
                assertEquals(0, rows.getLong(4));
            }
        }
    }
}
