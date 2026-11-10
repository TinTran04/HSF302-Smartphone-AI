package com.smartphoneai.ai;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MultipleAiBackupKeysMigrationTest {
    @Test void encryptedLegacyBackupBecomesNamedFirstBackupWithoutChangingActiveConfiguration() throws Exception {
        String url = "jdbc:h2:mem:multiplebackupmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("29").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            sql.execute("insert into ai_provider_configs(id,provider,model,key_cipher,backup_key_cipher,active,created_at) "
                    + "values(301,'GEMINI','legacy-model','primary-cipher','backup-cipher',true,CURRENT_TIMESTAMP)");
            sql.execute("insert into ai_provider_configs(id,provider,model,key_cipher,active,created_at) "
                    + "values(302,'GEMINI','primary-only','primary-only-cipher',false,CURRENT_TIMESTAMP)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var sql = connection.createStatement()) {
            try (var rows = sql.executeQuery("select name,priority,key_cipher,last_status from ai_backup_keys where config_id=301")) {
                assertTrue(rows.next());
                assertEquals("Dự phòng 1", rows.getString(1));
                assertEquals(1, rows.getInt(2));
                assertEquals("backup-cipher", rows.getString(3));
                assertEquals("UNKNOWN", rows.getString(4));
                assertFalse(rows.next());
            }
            try (var rows = sql.executeQuery("select count(*) from ai_backup_keys where config_id=302")) {
                assertTrue(rows.next());
                assertEquals(0, rows.getInt(1));
            }
            try (var rows = sql.executeQuery("select active,key_cipher from ai_provider_configs where id=301")) {
                assertTrue(rows.next());
                assertTrue(rows.getBoolean(1));
                assertEquals("primary-cipher", rows.getString(2));
            }
        }
    }
}
