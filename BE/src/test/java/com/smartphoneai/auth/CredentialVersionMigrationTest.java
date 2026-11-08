package com.smartphoneai.auth;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CredentialVersionMigrationTest {
    @Test void legacyAccountsAndNewRowsStartAtCredentialVersionZero() throws Exception {
        String url = "jdbc:h2:mem:credentialmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("21").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            statement.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000001','legacy@example.com','hash','Legacy','','','CUSTOMER',true)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            try (var columns = connection.getMetaData().getColumns(null, null, "USERS", "CREDENTIAL_VERSION")) {
                assertTrue(columns.next(), "Migration must add the credential version for legacy accounts");
            }
            statement.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000002','new@example.com','hash','New','','','CUSTOMER',true)");
            try (var rows = statement.executeQuery("select credential_version from users order by email")) {
                assertTrue(rows.next());
                assertEquals(0L, rows.getLong(1));
                assertTrue(rows.next());
                assertEquals(0L, rows.getLong(1));
            }
            assertThrows(java.sql.SQLException.class, () -> statement.execute("update users set credential_version=null where email='legacy@example.com'"));
        }
    }
}
