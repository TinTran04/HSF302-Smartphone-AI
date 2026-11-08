package com.smartphoneai.order;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MapLocationMigrationTest {
    @Test void existingRowsRetainNullPinsAndAllTablesRejectPartialOrOutOfRangePins() throws Exception {
        String url = "jdbc:h2:mem:maplocationmigration;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("26").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            statement.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000001','map-legacy@example.com','hash','Legacy','0900000000','123 Road','CUSTOMER',true)");
            statement.execute("insert into order_previews(id,user_id,full_name,phone,address,note,expires_at) values ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Legacy','0900000000','123 Road','',CURRENT_TIMESTAMP)");
            statement.execute("insert into orders(id,user_id,preview_id,idempotency_key,full_name,phone,address,note,total,status,created_at) values ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','legacy','Legacy','0900000000','123 Road','',0,'PENDING',CURRENT_TIMESTAMP)");
        }
        Flyway.configure().dataSource(url, "sa", "").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", ""); var statement = connection.createStatement()) {
            for (String table : new String[]{"users", "order_previews", "orders"}) {
                try (var columns = connection.getMetaData().getColumns(null, null, table.toUpperCase(java.util.Locale.ROOT), "LATITUDE")) {
                    assertTrue(columns.next(), "Migration must add nullable pin coordinates to " + table);
                }
                try (var rows = statement.executeQuery("select latitude,longitude from " + table)) {
                    assertTrue(rows.next());
                    assertNull(rows.getObject("latitude"));
                    assertNull(rows.getObject("longitude"));
                }
                assertThrows(SQLException.class, () -> statement.execute("update " + table + " set latitude=10"));
                assertThrows(SQLException.class, () -> statement.execute("update " + table + " set longitude=106"));
                assertThrows(SQLException.class, () -> statement.execute("update " + table + " set latitude=91,longitude=106"));
                assertThrows(SQLException.class, () -> statement.execute("update " + table + " set latitude=10,longitude=-181"));
                statement.execute("update " + table + " set latitude=-90,longitude=180");
                assertThrows(SQLException.class, () -> statement.execute("update " + table + " set latitude=null"));
                statement.execute("update " + table + " set latitude=null,longitude=null");
            }
        }
    }
}
