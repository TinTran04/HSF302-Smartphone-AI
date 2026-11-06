package com.smartphoneai.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.MaintenanceService;
import com.smartphoneai.support.JwtTestClient;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:productimages;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password="})
@AutoConfigureMockMvc
@Import(JwtTestClient.Configuration.class)
class ProductImageIntegrationTest {
    static final Path DIRECTORY = Path.of(System.getProperty("java.io.tmpdir"), "product-images-" + UUID.randomUUID());
    @DynamicPropertySource static void mediaDirectory(DynamicPropertyRegistry registry) {
        registry.add("app.product-images.directory", DIRECTORY::toString);
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserAccountRepository users;
    @Autowired AuthTokenService tokens;
    @Autowired MaintenanceService maintenance;

    @Test void uploadUsesActualBytesAndRoundTripsForGuestCustomerAndAdmin() throws Exception {
        var admin = admin();
        byte[] bytes = image("png");
        var result = mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile(
                "file", "../../private.svg", "text/plain", bytes)).with(admin).with(csrf()))
                .andExpect(status().isCreated()).andReturn();
        String url = mapper.readTree(result.getResponse().getContentAsString()).path("url").asText();
        assertTrue(url.matches("/api/product-images/[0-9a-f-]{36}\\.png"));
        assertArrayEquals(bytes, Files.readAllBytes(DIRECTORY.resolve(url.substring(url.lastIndexOf('/') + 1))));
        for (JwtTestClient client : new JwtTestClient[]{new JwtTestClient(), customer(), admin}) {
            mvc.perform(get(url).with(client)).andExpect(status().isOk())
                    .andExpect(content().contentType("image/png"))
                    .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                    .andExpect(content().bytes(bytes));
        }
    }

    @Test void acceptsJpegAndWebpButRejectsSpoofedOrMalformedImages() throws Exception {
        var admin = admin();
        mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "phone.jpg", "image/jpeg", image("jpg")))
                .with(admin).with(csrf())).andExpect(status().isCreated()).andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.endsWith(".jpg")));
        byte[] webp = Base64.getDecoder().decode("UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA");
        mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "phone.webp", "image/webp", webp))
                .with(admin).with(csrf())).andExpect(status().isCreated()).andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.endsWith(".webp")));
        for (byte[] invalid : new byte[][]{"<svg onload='alert(1)'/>".getBytes(), new byte[0],
                new byte[]{(byte)0x89, 'P', 'N', 'G', 13, 10, 26, 10}, java.util.Arrays.copyOf(webp, 20)}) {
            mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "phone.png", "image/png", invalid))
                    .with(admin).with(csrf())).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_PRODUCT_IMAGE"));
        }
    }

    @Test void rejectsOversizeMissingFilesAndUnsafeReadNamesWithoutLeakingPaths() throws Exception {
        var admin = admin();
        mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "large.png", "image/png", new byte[5 * 1024 * 1024 + 1]))
                .with(admin).with(csrf())).andExpect(status().isPayloadTooLarge()).andExpect(jsonPath("$.code").value("PRODUCT_IMAGE_TOO_LARGE"));
        mvc.perform(multipart("/api/admin/products/images").with(admin).with(csrf())).andExpect(status().isBadRequest());
        mvc.perform(get("/api/product-images/" + UUID.randomUUID() + ".png")).andExpect(status().isNotFound());
        mvc.perform(get("/api/product-images/application.yml")).andExpect(status().isNotFound());
        mvc.perform(get("/api/product-images/..%2Fapplication.yml")).andExpect(status().is4xxClientError());
    }

    @Test void rejectsImagesWithExcessiveDimensionsBeforeDecoding() throws Exception {
        var output = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(12001, 1, BufferedImage.TYPE_INT_RGB), "png", output);
        mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "wide.png", "image/png", output.toByteArray()))
                .with(admin()).with(csrf())).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_PRODUCT_IMAGE"));
    }

    @Test void uploadsRequireAdminAndCsrf() throws Exception {
        var file = new MockMultipartFile("file", "phone.png", "image/png", image("png"));
        mvc.perform(multipart("/api/admin/products/images").file(file).with(csrf())).andExpect(status().isUnauthorized());
        mvc.perform(multipart("/api/admin/products/images").file(file).with(customer()).with(csrf())).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/admin/products/images").file(file).with(admin())).andExpect(status().isForbidden());
    }

    @Test void adminImagePreviewsRemainAvailableDuringStoreMaintenance() throws Exception {
        var admin = admin();
        var uploaded = mvc.perform(multipart("/api/admin/products/images").file(new MockMultipartFile("file", "phone.png", "image/png", image("png")))
                .with(admin).with(csrf())).andExpect(status().isCreated()).andReturn();
        String url = mapper.readTree(uploaded.getResponse().getContentAsString()).path("url").asText();
        maintenance.setEnabled(true);
        try { mvc.perform(get(url).with(admin)).andExpect(status().isOk()); }
        finally { maintenance.setEnabled(false); }
    }

    private JwtTestClient admin() {
        var admin = UserAccount.invitedAdmin(UUID.randomUUID() + "@example.com", "Admin"); admin.activate();
        return JwtTestClient.authenticated(tokens, users.saveAndFlush(admin));
    }
    private JwtTestClient customer() {
        var user = UserAccount.pendingCustomer(UUID.randomUUID() + "@example.com", "An", "0900000000", "hash"); user.activate();
        return JwtTestClient.authenticated(tokens, users.saveAndFlush(user));
    }
    private byte[] image(String format) throws Exception {
        var output = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(new BufferedImage(2, 3, BufferedImage.TYPE_INT_RGB), format, output));
        return output.toByteArray();
    }
}
