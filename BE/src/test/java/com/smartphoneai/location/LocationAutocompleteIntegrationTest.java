package com.smartphoneai.location;

import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.service.MaintenanceService;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:locationautocomplete;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa", "spring.datasource.password=", "spring.config.import="})
@AutoConfigureMockMvc
class LocationAutocompleteIntegrationTest {
    private static final String PATH = "/api/locations/autocomplete";
    private static final String TEST_KEY = "private-test-key";
    private static final AtomicInteger CALLS = new AtomicInteger();
    private static final AtomicReference<Map<String, String>> QUERY = new AtomicReference<>();
    private static final HttpServer PROVIDER = provider();
    @Autowired MockMvc mvc;
    @MockitoBean MaintenanceService maintenance;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("app.maps.geoapify-api-key", () -> TEST_KEY);
        registry.add("app.maps.geoapify-base-url", () -> "http://localhost:" + PROVIDER.getAddress().getPort());
    }

    @AfterAll static void stopProvider() { PROVIDER.stop(0); }

    @Test void guestsCannotUseProviderQuota() throws Exception {
        int before = CALLS.get();
        mvc.perform(get(PATH).param("text", "Bưu điện")).andExpect(status().isUnauthorized());
        assertEquals(before, CALLS.get());
    }

    @Test void onlyCustomerAndAdminRolesCanUseSuggestions() throws Exception {
        for (String role : new String[]{"CUSTOMER", "ADMIN"}) {
            mvc.perform(get(PATH).with(account(role)).param("text", "ab"))
                    .andExpect(status().isOk()).andExpect(content().json("[]"));
        }
        mvc.perform(get(PATH).with(account("OTHER")).param("text", "ab"))
                .andExpect(status().isForbidden());
    }

    @Test void shortAndBlankQueriesDoNotCallProvider() throws Exception {
        int before = CALLS.get();
        for (String text : new String[]{"", " ", " a ", "ab"}) {
            mvc.perform(get(PATH).with(account("CUSTOMER")).param("text", text))
                    .andExpect(status().isOk()).andExpect(content().json("[]"));
        }
        assertEquals(before, CALLS.get());
    }

    @Test void oversizedAndMissingQueriesReturnControlledValidationWithoutEcho() throws Exception {
        int before = CALLS.get();
        var response = mvc.perform(get(PATH).with(account("CUSTOMER")).param("text", "private-address".repeat(30)))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(response.contains("private-address"));
        mvc.perform(get(PATH).with(account("CUSTOMER")))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        assertEquals(before, CALLS.get());
    }

    @Test void serverSendsVietnameseProviderParametersAndExposesOnlySuggestionContract() throws Exception {
        var response = mvc.perform(get(PATH).with(account("CUSTOMER")).param("text", "  Bưu điện Sài Gòn  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("geo-vn-1"))
                .andExpect(jsonPath("$[0].label").value("Bưu điện Sài Gòn, Việt Nam"))
                .andExpect(jsonPath("$[0].location.latitude").value(10.7798))
                .andExpect(jsonPath("$[0].location.longitude").value(106.6990))
                .andExpect(jsonPath("$[0].apiKey").doesNotExist())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertFalse(response.contains(TEST_KEY));
        assertEquals(Map.of("text", "Bưu điện Sài Gòn", "apiKey", TEST_KEY,
                "format", "json", "filter", "countrycode:vn", "lang", "vi", "limit", "5"), QUERY.get());
    }

    @Test void maintenancePreservesAdminProfileLookupAndBlocksCustomerLookup() throws Exception {
        when(maintenance.isEnabled()).thenReturn(true);
        mvc.perform(get(PATH).with(account("ADMIN")).param("text", "ab"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get(PATH).with(account("CUSTOMER")).param("text", "ab"))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("MAINTENANCE_MODE"));
        mvc.perform(get(PATH).param("text", "ab")).andExpect(status().isUnauthorized());
    }

    @Test void reverseRequiresCustomerOrAdminWithoutSpendingGuestOrOtherRoleQuota() throws Exception {
        int before = CALLS.get();
        mvc.perform(get("/api/locations/reverse").param("latitude", "10").param("longitude", "106"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/locations/reverse").with(account("OTHER")).param("latitude", "10").param("longitude", "106"))
                .andExpect(status().isForbidden());
        assertEquals(before, CALLS.get());
        for (String role : new String[]{"CUSTOMER", "ADMIN"}) {
            mvc.perform(get("/api/locations/reverse").with(account(role)).param("latitude", "10").param("longitude", "106"))
                    .andExpect(status().isOk()).andExpect(content().json("{\"label\":\"Berlin, Germany\"}", true));
        }
    }

    @Test void reverseUsesGlobalProviderParametersAndReturnsOnlyLabel() throws Exception {
        var response = mvc.perform(get("/api/locations/reverse").with(account("CUSTOMER"))
                        .param("latitude", "52.520008").param("longitude", "13.404954"))
                .andExpect(status().isOk()).andExpect(content().json("{\"label\":\"Berlin, Germany\"}", true))
                .andReturn().getResponse().getContentAsString();
        assertFalse(response.contains(TEST_KEY));
        assertEquals(Map.of("lat", "52.520008", "lon", "13.404954", "apiKey", TEST_KEY,
                "format", "json", "lang", "vi", "limit", "1"), QUERY.get());
    }

    @Test void reversePreservesAdminMaintenanceExemptionAndGuestUnauthorizedResponse() throws Exception {
        when(maintenance.isEnabled()).thenReturn(true);
        mvc.perform(get("/api/locations/reverse").with(account("ADMIN")).param("latitude", "11").param("longitude", "106"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.label").value("Berlin, Germany"));
        mvc.perform(get("/api/locations/reverse").with(account("CUSTOMER")).param("latitude", "11").param("longitude", "106"))
                .andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("MAINTENANCE_MODE"));
        mvc.perform(get("/api/locations/reverse").param("latitude", "11").param("longitude", "106"))
                .andExpect(status().isUnauthorized());
    }

    private static RequestPostProcessor account(String role) {
        return authentication(new UsernamePasswordAuthenticationToken(new AccountPrincipal(UUID.randomUUID()), null,
                java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    private static HttpServer provider() {
        try {
            var server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
            server.createContext("/v1/geocode/", exchange -> {
                CALLS.incrementAndGet();
                QUERY.set(Arrays.stream(exchange.getRequestURI().getRawQuery().split("&"))
                        .map(pair -> pair.split("=", 2))
                        .collect(Collectors.toMap(pair -> decode(pair[0]), pair -> decode(pair[1]))));
                byte[] body = (exchange.getRequestURI().getPath().endsWith("reverse")
                        ? "{\"results\":[{\"formatted\":\"Berlin, Germany\",\"lat\":52.5,\"lon\":13.4,\"country_code\":\"de\"}]}" : """
                        {"results":[{"place_id":"geo-vn-1","formatted":"Bưu điện Sài Gòn, Việt Nam",
                        "lat":10.7798,"lon":106.6990,"country_code":"vn"}]}
                        """).getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (var output = exchange.getResponseBody()) { output.write(body); }
            });
            server.start();
            return server;
        } catch (java.io.IOException exception) { throw new ExceptionInInitializerError(exception); }
    }

    private static String decode(String value) { return URLDecoder.decode(value, StandardCharsets.UTF_8); }
}
