package com.smartphoneai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.GeoLocation;
import com.smartphoneai.dto.response.AddressSuggestionResponse;
import com.smartphoneai.exception.InvalidLocationQueryException;
import com.smartphoneai.exception.LocationSearchException;
import com.smartphoneai.service.LocationService;
import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class LocationServiceImpl implements LocationService {
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final int CACHE_CAPACITY = 100;
    private static final int PROVIDER_REQUESTS_PER_SECOND = 4;
    private final String apiKey;
    private final String baseUrl;
    private final ObjectMapper mapper;
    private final Clock clock;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
    private final Map<String, CachedSuggestions> cache = new LinkedHashMap<>(16, 0.75f, true);
    private final ArrayDeque<Instant> providerRequests = new ArrayDeque<>();

    public LocationServiceImpl(@Value("${app.maps.geoapify-api-key:}") String apiKey,
                              @Value("${app.maps.geoapify-base-url:https://api.geoapify.com}") String baseUrl,
                              ObjectMapper mapper, Clock clock) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Override
    public List<AddressSuggestionResponse> autocomplete(String text) {
        if (text == null || text.length() > 255) throw new InvalidLocationQueryException();
        String query = text.trim();
        if (query.length() < 3) return List.of();
        if (apiKey == null || apiKey.isBlank()) throw new LocationSearchException(false);
        synchronized (cache) {
            Instant now = clock.instant();
            cache.values().removeIf(entry -> !entry.expiresAt().isAfter(now));
            var cached = cache.get(query);
            if (cached != null) return cached.suggestions();
            Instant windowStart = now.minusSeconds(1);
            while (!providerRequests.isEmpty() && !providerRequests.peekFirst().isAfter(windowStart)) {
                providerRequests.removeFirst();
            }
            if (providerRequests.size() >= PROVIDER_REQUESTS_PER_SECOND) throw new LocationSearchException(true);
            providerRequests.addLast(now);
        }
        var suggestions = fetchSuggestions(query);
        synchronized (cache) {
            cache.put(query, new CachedSuggestions(suggestions, clock.instant().plus(CACHE_TTL)));
            if (cache.size() > CACHE_CAPACITY) cache.remove(cache.keySet().iterator().next());
        }
        return suggestions;
    }

    private List<AddressSuggestionResponse> fetchSuggestions(String query) {
        try {
            var uri = UriComponentsBuilder.fromUriString(baseUrl).path("/v1/geocode/autocomplete")
                    .queryParam("text", query).queryParam("apiKey", apiKey)
                    .queryParam("format", "json").queryParam("filter", "countrycode:vn")
                    .queryParam("lang", "vi").queryParam("limit", 5).build().encode().toUri();
            var response = client.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(3)).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new LocationSearchException(response.statusCode() == 429);
            var root = mapper.readTree(response.body());
            var results = root == null ? null : root.get("results");
            if (results == null || !results.isArray()) throw new LocationSearchException(false);
            var suggestions = new ArrayList<AddressSuggestionResponse>();
            var identifiers = new HashSet<String>();
            for (var result : results) {
                var id = result.path("place_id");
                var label = result.path("formatted");
                var latitude = result.path("lat");
                var longitude = result.path("lon");
                var country = result.path("country_code");
                if (!id.isTextual() || id.asText().isBlank() || !label.isTextual() || label.asText().isBlank()
                        || !latitude.isNumber() || !longitude.isNumber()) continue;
                if (!country.isMissingNode() && !country.isNull()
                        && (!country.isTextual() || !country.asText().equalsIgnoreCase("vn"))) continue;
                double lat = latitude.asDouble();
                double lon = longitude.asDouble();
                if (!Double.isFinite(lat) || !Double.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
                String identifier = id.asText().trim();
                if (!identifiers.add(identifier)) continue;
                suggestions.add(new AddressSuggestionResponse(identifier, label.asText().trim(), new GeoLocation(lat, lon)));
                if (suggestions.size() == 5) break;
            }
            return List.copyOf(suggestions);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new LocationSearchException(false);
        } catch (IOException | IllegalArgumentException exception) {
            // Provider exceptions and URIs can contain the private API key; never retain or log them.
            throw new LocationSearchException(false);
        }
    }

    private record CachedSuggestions(List<AddressSuggestionResponse> suggestions, Instant expiresAt) {}
}
