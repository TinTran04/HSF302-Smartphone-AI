package com.smartphoneai.product;

import java.sql.DriverManager;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;

import static org.junit.jupiter.api.Assertions.*;

class DatasetPhotoMigrationTest {
    @Test
    void fillsMissingImagesPreservesCustomImagesAndCanBeRepeated() throws Exception {
        String url = "jdbc:h2:mem:datasetphotos;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("25").load().migrate();
        try (var connection = DriverManager.getConnection(url, "sa", "");
             var statement = connection.createStatement()) {
            for (int id = 1; id <= 4; id++) {
                statement.execute("insert into products(id,name) values (" + id + ",'Admin renamed phone " + id + "')");
                statement.execute("insert into product_variants(product_id,color,storage,price,image) values (" + id
                        + ",'Black','128GB',1000000," + (id == 3 ? "'/custom/variant.webp'" : "null") + ")");
            }
            statement.execute("insert into product_specifications values (1,'URL nguồn','https://www.mobiledokan.co/product/oneplus-n6/'),"
                    + "(2,'URL nguồn','https://www.mobiledokan.co/product/xiaomi-redmi-note-17-china/'),"
                    + "(3,'URL nguồn','https://www.mobiledokan.co/product/oneplus-n6/'),"
                    + "(4,'URL nguồn','https://example.com/unrelated')");
            statement.execute("insert into product_images values (2,0,'/images/placeholder.svg'),(2,1,'/custom/gallery.webp'),"
                    + "(3,0,'/custom/cover.webp')");
            Flyway.configure().dataSource(url, "sa", "").load().migrate();
            for (int run = 0; run < 2; run++) {
                if (run == 1) ScriptUtils.executeSqlScript(connection,
                        new ClassPathResource("db/migration/V26__phone_dataset_images.sql"));
                try (var rows = statement.executeQuery("select product_id,url from product_images order by product_id,position")) {
                    assertTrue(rows.next()); assertEquals(1, rows.getInt(1));
                    assertEquals("/images/phones/oneplus-n6.webp", rows.getString(2));
                    assertTrue(rows.next()); assertEquals(2, rows.getInt(1));
                    assertEquals("/images/phones/xiaomi-redmi-note-17-china.webp", rows.getString(2));
                    assertTrue(rows.next()); assertEquals("/custom/gallery.webp", rows.getString(2));
                    assertTrue(rows.next()); assertEquals("/custom/cover.webp", rows.getString(2));
                    assertFalse(rows.next());
                }
                try (var rows = statement.executeQuery("select image from product_variants order by product_id")) {
                    assertTrue(rows.next()); assertEquals("/images/phones/oneplus-n6.webp", rows.getString(1));
                    assertTrue(rows.next()); assertEquals("/images/phones/xiaomi-redmi-note-17-china.webp", rows.getString(1));
                    assertTrue(rows.next()); assertEquals("/custom/variant.webp", rows.getString(1));
                    assertTrue(rows.next()); assertNull(rows.getString(1));
                }
            }
        }
    }
}
