package com.smartphoneai.location;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.controller.LocationController;
import com.smartphoneai.exception.GlobalExceptionHandler;
import com.smartphoneai.service.impl.LocationServiceImpl;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(OutputCaptureExtension.class)
class LocationReverseServiceTest {
    private static final String KEY = "secret-reverse-key-never-echo";
    private static final String GOOD_RESULT = """
            {"results":[{"formatted":"  Berlin, Germany  ","lat":52.5,"lon":13.4,"country_code":"de"}]}
            """;
    private HttpServer server;
    private ExecutorService executor;
    private final AtomicInteger calls = new AtomicInteger();
    private final MutableClock clock = new MutableClock();
    private volatile String body = GOOD_RESULT;
    private volatile int providerStatus = 200;
    private volatile long delayMs;
    private volatile Map<String, String> query;
    private LocationServiceImpl service;
    private MockMvc mvc;

    @BeforeEach void startProvider() throws Exception {
        executor = Executors.newVirtualThreadPerTaskExecutor();
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.setExecutor(executor);
        server.createContext("/v1/geocode/", exchange -> {
            calls.incrementAndGet();
            query = Arrays.stream(exchange.getRequestURI().getRawQuery().split("&"))
                    .map(pair -> pair.split("=", 2)).collect(Collectors.toMap(
                            pair -> URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                            pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8)));
            try {
                if (delayMs > 0) Thread.sleep(delayMs);
                byte[] bytes = (exchange.getRequestURI().getPath().endsWith("autocomplete")
                        ? "{\"results\":[]}" : body).getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(providerStatus, bytes.length);
                try (var output = exchange.getResponseBody()) { output.write(bytes); }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            } catch (java.io.IOException disconnected) {
                // A timed out client may close before the delayed response is sent.
            } finally { exchange.close(); }
        });
        server.start();
        service = create(KEY);
        mvc = mvc(service);
    }

    @AfterEach void stopProvider() { server.stop(0); executor.shutdownNow(); }

    @Test void reverseRequestsGlobalVietnameseAddressAndReturnsOnlyTrimmedLabel() throws Exception {
        String response = mvc.perform(reverse("52.520008", "13.404954"))
                .andExpect(status().isOk()).andExpect(content().json("{\"label\":\"Berlin, Germany\"}", true))
                .andReturn().getResponse().getContentAsString();
        assertEquals(Map.of("lat", "52.520008", "lon", "13.404954", "format", "json",
                "lang", "vi", "limit", "1", "apiKey", KEY), query);
        assertFalse(response.contains(KEY));
    }

    @Test void equivalentCoordinateValuesShareCacheUntilTenMinuteExpiry() throws Exception {
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        clock.advance(Duration.ofMinutes(9));
        mvc.perform(reverse("10.0", "106.000")).andExpect(status().isOk());
        assertEquals(1, calls.get());
        clock.advance(Duration.ofMinutes(1));
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        assertEquals(2, calls.get());
    }

    @Test void autocompleteAndReverseUseDistinctCacheKeysAndOneSharedCapacity() throws Exception {
        service.autocomplete("10.0,106.0");
        mvc.perform(reverse("10", "106")).andExpect(status().isOk()).andExpect(jsonPath("$.label").value("Berlin, Germany"));
        clock.advance(Duration.ofSeconds(1));
        for (int index = 0; index < 99; index++) {
            service.autocomplete("address " + index);
            clock.advance(Duration.ofSeconds(1));
        }
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        assertEquals(101, calls.get());
        service.autocomplete("10.0,106.0");
        assertEquals(102, calls.get());
    }

    @Test void autocompleteAndReverseShareFourRequestsPerSecondButCacheHitsRemainAvailable() throws Exception {
        service.autocomplete("query 1");
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        service.autocomplete("query 2");
        mvc.perform(reverse("11", "106")).andExpect(status().isOk());
        mvc.perform(reverse("12", "106")).andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_RATE_LIMIT"));
        assertEquals(4, calls.get());
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        service.autocomplete("query 1");
        assertEquals(4, calls.get());
        clock.advance(Duration.ofSeconds(1));
        mvc.perform(reverse("12", "106")).andExpect(status().isOk());
        assertEquals(5, calls.get());
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"results\":[]}", "{\"results\":[null]}", "{\"results\":[{}]}",
            "{\"results\":[{\"formatted\":\" \"}]}", "{\"results\":[{\"formatted\":123}]}"})
    void noUsableAddressReturnsNoLabelAndCachesTheMiss(String response) throws Exception {
        body = response;
        for (int attempt = 0; attempt < 2; attempt++) {
            mvc.perform(reverse("10", "106")).andExpect(status().isOk()).andExpect(content().string("null"));
        }
        assertEquals(1, calls.get());
    }

    @ParameterizedTest
    @ValueSource(strings = {"not json", "{}", "{\"results\":null}", "{\"results\":{}}", "null"})
    void malformedProviderPayloadIsControlledAndSanitized(String response, CapturedOutput output) throws Exception {
        body = response;
        assertUnavailable(mvc);
        assertFalse(output.getAll().contains(KEY));
    }

    @ParameterizedTest
    @ValueSource(ints = {401, 403, 500})
    void upstreamFailureIsSanitizedAndNotCached(int code, CapturedOutput output) throws Exception {
        providerStatus = code;
        body = "private failure " + KEY;
        assertUnavailable(mvc);
        providerStatus = 200;
        body = GOOD_RESULT;
        mvc.perform(reverse("10", "106")).andExpect(status().isOk()).andExpect(jsonPath("$.label").value("Berlin, Germany"));
        assertEquals(2, calls.get());
        assertFalse(output.getAll().contains(KEY));
    }

    @Test void providerRateLimitReturnsControlled429WithoutCachingIt() throws Exception {
        providerStatus = 429;
        body = KEY;
        mvc.perform(reverse("10", "106")).andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_RATE_LIMIT"));
        providerStatus = 200;
        body = GOOD_RESULT;
        mvc.perform(reverse("10", "106")).andExpect(status().isOk());
        assertEquals(2, calls.get());
    }

    @Test void missingKeyPreventsProviderTraffic() throws Exception {
        assertUnavailable(mvc(create(" ")));
        assertEquals(0, calls.get());
    }

    @Test void timeoutIsBoundedAndSanitized(CapturedOutput output) throws Exception {
        delayMs = 4000;
        long started = System.nanoTime();
        assertUnavailable(mvc);
        assertTrue(Duration.ofNanos(System.nanoTime() - started).compareTo(Duration.ofSeconds(4)) < 0);
        assertFalse(output.getAll().contains(KEY));
    }

    @Test void connectionFailureIsControlledAndSanitized(CapturedOutput output) throws Exception {
        server.stop(0);
        assertUnavailable(mvc);
        assertFalse(output.getAll().contains(KEY));
    }

    @Test void missingOutOfRangeNonNumericAndNonFiniteCoordinatesAreRejectedBeforeProvider() throws Exception {
        String[][] invalid = {{null, "106"}, {"10", null}, {null, null}, {"", "106"},
                {"NaN", "106"}, {"10", "NaN"}, {"Infinity", "106"}, {"10", "-Infinity"},
                {"90.0001", "106"}, {"-90.0001", "106"}, {"10", "180.0001"}, {"10", "-180.0001"},
                {"private-address", "106"}};
        for (String[] point : invalid) {
            String response = mvc.perform(reverse(point[0], point[1])).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                    .andReturn().getResponse().getContentAsString();
            assertFalse(response.contains("private-address"));
        }
        assertEquals(0, calls.get());
    }

    @Test void inclusiveCoordinateBoundsAndZeroAreAllowed() throws Exception {
        for (String[] point : new String[][]{{"-90", "-180"}, {"90", "180"}, {"0", "0"}}) {
            mvc.perform(reverse(point[0], point[1])).andExpect(status().isOk());
        }
        assertEquals(3, calls.get());
    }

    private void assertUnavailable(MockMvc target) throws Exception {
        String response = target.perform(reverse("10", "106")).andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(response.contains(KEY));
        assertFalse(response.contains("private failure"));
    }

    private MockHttpServletRequestBuilder reverse(String latitude, String longitude) {
        var request = get("/api/locations/reverse");
        if (latitude != null) request.param("latitude", latitude);
        if (longitude != null) request.param("longitude", longitude);
        return request;
    }

    private LocationServiceImpl create(String key) {
        return new LocationServiceImpl(key, "http://localhost:" + server.getAddress().getPort(), new ObjectMapper(), clock);
    }

    private MockMvc mvc(LocationServiceImpl locations) {
        return MockMvcBuilders.standaloneSetup(new LocationController(locations))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private static class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-11-06T00:00:00Z");
        void advance(Duration duration) { now = now.plus(duration); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
