package com.smartphoneai.auth;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

class RoleRemovalMigrationTest {
    @Test void deletesLegacyStaffAndTheirDataButKeepsCustomersAndAdmins() throws Exception {
        verifyMigration("jdbc:h2:mem:legacyroles;DB_CLOSE_DELAY=-1", "sa", "", false);
    }

    @Test void postgresMigrationDeletesLegacyUsersWithoutTouchingOthers() throws Exception {
        String url = System.getenv("TEST_POSTGRES_URL");
        assumeTrue(url != null && !url.isBlank(), "Requires a dedicated empty PostgreSQL test database");
        verifyMigration(url, System.getenv("TEST_POSTGRES_USERNAME"), System.getenv("TEST_POSTGRES_PASSWORD"), true);
    }

    private void verifyMigration(String url, String username, String password, boolean postgres) throws Exception {
        if (postgres) {
            try (var connection = DriverManager.getConnection(url, username, password);
                 var statement = connection.createStatement();
                 var tables = statement.executeQuery("select count(*) from information_schema.tables where table_schema = 'public'")) {
                tables.next();
                if (tables.getInt(1) != 0) throw new IllegalStateException("PostgreSQL test database must be empty");
            }
        }
        String[] locations = postgres ? new String[] { "classpath:db/migration", "classpath:db/vendor/postgresql" } : new String[] { "classpath:db/migration" };
        Flyway.configure().dataSource(url, username, password).locations(locations).target("19").load().migrate();
        try (var connection = DriverManager.getConnection(url, username, password); var s = connection.createStatement()) {
            s.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000001','staff@example.com','hash','Staff','','','STAFF',true), ('00000000-0000-0000-0000-000000000002','customer@example.com','hash','Customer','','','CUSTOMER',true), ('00000000-0000-0000-0000-000000000003','admin@example.com','hash','Admin','','','ADMIN',true)");
            s.execute("insert into users(id,email,password_hash,full_name,phone,address,role,active) values ('00000000-0000-0000-0000-000000000004','manager@example.com','hash','Manager','','','MANAGER',true)");
            s.execute("insert into carts(user_id) values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002')");
            s.execute("insert into admin_invitations(id,user_id,token_hash,expires_at,consumed) values ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','hash1',CURRENT_TIMESTAMP,false)");
            s.execute("insert into ai_conversations(id,user_id,topic,title,created_at,product_ids) values ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','GENERAL_CHAT','test',CURRENT_TIMESTAMP,'[]')");
            s.execute("insert into ai_messages(conversation_id,role,content,sources_json,recommendations_json,comparisons_json,created_at) values ('20000000-0000-0000-0000-000000000001','user','hello','[]','[]','[]',CURRENT_TIMESTAMP)");
            s.execute("insert into order_previews(id,user_id,full_name,phone,address,note,expires_at) values ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','Manager','123','Address','',CURRENT_TIMESTAMP), ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Customer','123','Address','',CURRENT_TIMESTAMP)");
            s.execute("insert into orders(id,user_id,preview_id,idempotency_key,full_name,phone,address,note,total,status,created_at) values ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','manager-order','Manager','123','Address','',100,'PENDING',CURRENT_TIMESTAMP), ('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','customer-order','Customer','123','Address','',100,'PENDING',CURRENT_TIMESTAMP)");
            s.execute("insert into order_items(id,order_id,variant_id,product_name,color,storage,quantity,unit_price) values ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',1,'Phone','Black','128GB',1,100)");
            s.execute("insert into order_status_history(id,order_id,status,changed_at) values ('60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','PENDING',CURRENT_TIMESTAMP)");
        }
        Flyway.configure().dataSource(url, username, password).locations(locations).load().migrate();
        try (var connection = DriverManager.getConnection(url, username, password); var s = connection.createStatement()) {
            try (var rows = s.executeQuery("select count(*) from users")) { rows.next(); assertEquals(2, rows.getInt(1)); }
            try (var rows = s.executeQuery("select count(*) from carts")) { rows.next(); assertEquals(1, rows.getInt(1)); }
            try (var rows = s.executeQuery("select count(*) from ai_messages")) { rows.next(); assertEquals(0, rows.getInt(1)); }
            try (var rows = s.executeQuery("select count(*) from orders")) { rows.next(); assertEquals(1, rows.getInt(1)); }
            try (var rows = s.executeQuery("select count(*) from order_items")) { rows.next(); assertEquals(0, rows.getInt(1)); }
            assertThrows(java.sql.SQLException.class, () -> s.execute("update users set role='STAFF' where email='customer@example.com'"));
        }
    }
}
