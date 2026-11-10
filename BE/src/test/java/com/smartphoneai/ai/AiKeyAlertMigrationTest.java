package com.smartphoneai.ai;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AiKeyAlertMigrationTest {
    @Test void existingConfigurationIsPreservedAndAlertsReferenceTheirConfiguration() throws Exception {
        String url = "jdbc:h2:mem:aikeyalertmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("28").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            sql.execute("insert into ai_provider_configs(id,provider,model,key_cipher,backup_key_cipher,active,created_at) "
                    + "values (101,'GEMINI','existing-model','cipher-primary','cipher-backup',true,CURRENT_TIMESTAMP)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            try (var rows = sql.executeQuery("select model,key_cipher,backup_key_cipher,active from ai_provider_configs where id=101")) {
                assertTrue(rows.next());
                assertEquals("existing-model", rows.getString(1));
                assertEquals("cipher-primary", rows.getString(2));
                assertEquals("cipher-backup", rows.getString(3));
                assertTrue(rows.getBoolean(4));
            }
            sql.execute("insert into ai_key_alerts(config_id,status,reason,detected_at) "
                    + "values (101,'USING_BACKUP','AI_PROVIDER_RATE_LIMIT',CURRENT_TIMESTAMP)");
            assertThrows(SQLException.class, () -> sql.execute("insert into ai_key_alerts(config_id,status,detected_at) "
                    + "values (999,'USING_BACKUP',CURRENT_TIMESTAMP)"));
            sql.execute("delete from ai_provider_configs where id=101");
            try (var rows = sql.executeQuery("select count(*) from ai_key_alerts")) {
                assertTrue(rows.next());
                assertEquals(0, rows.getInt(1));
            }
        }
    }
}
