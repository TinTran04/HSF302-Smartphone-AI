package com.smartphoneai.location;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.controller.LocationController;
import com.smartphoneai.exception.GlobalExceptionHandler;
import com.smartphoneai.exception.LocationSearchException;
import com.smartphoneai.service.impl.LocationServiceImpl;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(OutputCaptureExtension.class)
class LocationServiceTest {
    private static final String KEY = "secret-provider-key-never-echo";
    private static final String GOOD_RESULT = """
            {"results":[{"place_id":"vn-1","formatted":"Hồ Chí Minh, Việt Nam",
            "lat":10.7769,"lon":106.7009,"country_code":"vn"}]}
            """;
    private HttpServer server;
    private ExecutorService executor;
    private final AtomicInteger calls = new AtomicInteger();
    private final MutableClock clock = new MutableClock();
    private volatile int status = 200;
    private volatile String body = GOOD_RESULT;
    private volatile long delayMs;
    private LocationServiceImpl service;

    @BeforeEach void startProvider() throws Exception {
        executor = Executors.newVirtualThreadPerTaskExecutor();
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.setExecutor(executor);
        server.createContext("/v1/geocode/autocomplete", exchange -> {
            calls.incrementAndGet();
            try {
                if (delayMs > 0) Thread.sleep(delayMs);
                byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(status, bytes.length);
                try (var output = exchange.getResponseBody()) { output.write(bytes); }
            } catch (InterruptedException interrupted) {
                Thread.currentThread().interrupt();
            } catch (java.io.IOException disconnected) {
                // A client timeout closes the connection before the delayed fixture is written.
            } finally { exchange.close(); }
        });
        server.start();
        service = create(KEY);
    }

    @AfterEach void stopProvider() {
        server.stop(0);
        executor.shutdownNow();
    }

    @Test void normalizedRepeatedQueriesUseCacheUntilTenMinuteExpiry() {
        assertEquals("vn-1", service.autocomplete("  Hồ Chí Minh  ").getFirst().id());
        clock.advance(Duration.ofMinutes(9));
        assertEquals("vn-1", service.autocomplete("Hồ Chí Minh").getFirst().id());
        assertEquals(1, calls.get());
        clock.advance(Duration.ofMinutes(1));
        service.autocomplete("Hồ Chí Minh");
        assertEquals(2, calls.get());
    }

    @Test void cacheEvictsOldestQueriesAtOneHundredEntries() {
        for (int index = 0; index < 101; index++) {
            service.autocomplete("address " + index);
            clock.advance(Duration.ofSeconds(1));
        }
        service.autocomplete("address 100");
        assertEquals(101, calls.get());
        service.autocomplete("address 0");
        assertEquals(102, calls.get());
    }

    @Test void globalRollingRateLimitRejectsFifthProviderCallButAllowsCachedResults() throws Exception {
        for (int index = 0; index < 4; index++) service.autocomplete("query " + index);
        mvc(service).perform(get("/api/locations/autocomplete").param("text", "query 4"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_RATE_LIMIT"));
        assertEquals(4, calls.get());
        assertEquals(1, service.autocomplete("query 0").size());
        clock.advance(Duration.ofSeconds(1));
        service.autocomplete("query 4");
        assertEquals(5, calls.get());
    }

    @Test void invalidAndForeignSuggestionsAreDiscardedAndValidCoordinatesStayInLatitudeLongitudeOrder() {
        body = """
                {"results":[
                  {"place_id":"valid","formatted":"Việt Nam","lat":10.1,"lon":106.2,"country_code":"VN"},
                  {"place_id":"unknown-country","formatted":"Vietnam address","lat":21,"lon":105},
                  {"place_id":"foreign","formatted":"Other country","lat":10,"lon":106,"country_code":"us"},
                  {"place_id":"lat-range","formatted":"Invalid","lat":91,"lon":106},
                  {"place_id":"lon-range","formatted":"Invalid","lat":10,"lon":181},
                  {"place_id":"string-coords","formatted":"Invalid","lat":"10","lon":106},
                  {"place_id":"missing-coords","formatted":"Invalid"},
                  {"place_id":"blank-label","formatted":" ","lat":10,"lon":106},
                  {"formatted":"Missing identifier","lat":10,"lon":106},
                  null
                ]}
                """;
        var results = service.autocomplete("Vietnam");
        assertEquals(2, results.size());
        assertEquals("valid", results.getFirst().id());
        assertEquals(10.1, results.getFirst().location().latitude());
        assertEquals(106.2, results.getFirst().location().longitude());
        assertEquals("unknown-country", results.get(1).id());
    }

    @Test void providerCannotExceedFiveDistinctSuggestions() {
        body = """
                {"results":[
                {"place_id":"1","formatted":"One","lat":10,"lon":106},
                {"place_id":"1","formatted":"Duplicate","lat":10,"lon":106},
                {"place_id":"2","formatted":"Two","lat":10,"lon":106},
                {"place_id":"3","formatted":"Three","lat":10,"lon":106},
                {"place_id":"4","formatted":"Four","lat":10,"lon":106},
                {"place_id":"5","formatted":"Five","lat":10,"lon":106},
                {"place_id":"6","formatted":"Six","lat":10,"lon":106}]}
                """;
        var results = service.autocomplete("Vietnam");
        assertEquals(java.util.List.of("1", "2", "3", "4", "5"), results.stream().map(result -> result.id()).toList());
    }

    @ParameterizedTest
    @ValueSource(strings = {"not json", "{}", "{\"results\":null}", "{\"results\":{}}", "null"})
    void malformedProviderResponseReturnsControlledUnavailable(String response, CapturedOutput output) throws Exception {
        body = response;
        var failure = mvc(service).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(failure.contains(KEY));
        assertFalse(output.getAll().contains(KEY));
    }

    @ParameterizedTest
    @ValueSource(ints = {401, 403, 500})
    void upstreamErrorsNeverExposeBodyKeyUriOrCause(int code, CapturedOutput output) throws Exception {
        status = code;
        body = "private provider failure " + KEY;
        var failure = mvc(service).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"))
                .andReturn().getResponse().getContentAsString();
        assertFalse(failure.contains(KEY));
        assertFalse(failure.contains("private provider failure"));
        assertFalse(output.getAll().contains(KEY));
        var exception = assertThrows(LocationSearchException.class, () -> service.autocomplete("other query"));
        assertNull(exception.getCause());
        assertFalse(exception.toString().contains(KEY));
    }

    @Test void missingKeyReturnsControlledUnavailableWithoutProviderTraffic() throws Exception {
        var disabled = create(" ");
        assertTrue(disabled.autocomplete("ab").isEmpty());
        mvc(disabled).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"));
        assertEquals(0, calls.get());
    }

    @Test void providerRateLimitIsControlledAndNotCached() throws Exception {
        status = 429;
        body = KEY;
        mvc(service).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_RATE_LIMIT"));
        status = 200;
        body = GOOD_RESULT;
        assertEquals(1, service.autocomplete("Vietnam").size());
        assertEquals(2, calls.get());
    }

    @Test void providerTimeoutIsBoundedAndSanitized(CapturedOutput output) throws Exception {
        delayMs = 4000;
        long started = System.nanoTime();
        mvc(service).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"));
        assertTrue(Duration.ofNanos(System.nanoTime() - started).compareTo(Duration.ofSeconds(4)) < 0);
        assertFalse(output.getAll().contains(KEY));
    }

    @Test void connectionFailureIsControlledAndDoesNotRetainKey(CapturedOutput output) throws Exception {
        server.stop(0);
        mvc(service).perform(get("/api/locations/autocomplete").param("text", "Vietnam"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("LOCATION_SEARCH_UNAVAILABLE"));
        assertFalse(output.getAll().contains(KEY));
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
