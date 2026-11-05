package com.smartphoneai.auth;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccountDisabledMigrationTest {
    @Test void legacyAndNewAccountsRemainEnabledAndNullLockStateIsRejected() throws Exception {
        String url = "jdbc:h2:mem:disabledmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("23").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            statement.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000001','legacy@example.com','hash','Legacy','','','CUSTOMER',true)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            try (var columns = connection.getMetaData().getColumns(null, null, "USERS", "DISABLED")) {
                assertTrue(columns.next(), "Migration must add the disabled flag for existing accounts");
            }
            statement.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000002','new@example.com','hash','New','','','ADMIN',false)");
            try (var rows = statement.executeQuery("select disabled,active from users order by email")) {
                assertTrue(rows.next());
                assertFalse(rows.getBoolean("disabled"));
                assertTrue(rows.getBoolean("active"));
                assertTrue(rows.next());
                assertFalse(rows.getBoolean("disabled"));
                assertFalse(rows.getBoolean("active"));
            }
            assertThrows(java.sql.SQLException.class, () -> statement.execute("update users set disabled=null where email='legacy@example.com'"));
        }
    }
}
