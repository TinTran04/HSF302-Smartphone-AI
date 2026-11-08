package com.smartphoneai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartphoneai.dto.GeoLocation;
import com.smartphoneai.dto.response.AddressSuggestionResponse;
import com.smartphoneai.dto.response.ReverseLocationResponse;
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
import java.util.Optional;
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
    private final Map<String, CacheEntry> cache = new LinkedHashMap<>(16, 0.75f, true);
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
            if (cached != null) {
                @SuppressWarnings("unchecked")
                var list = (List<AddressSuggestionResponse>) cached.value();
                return list;
            }
            Instant windowStart = now.minusSeconds(1);
            while (!providerRequests.isEmpty() && !providerRequests.peekFirst().isAfter(windowStart)) {
                providerRequests.removeFirst();
            }
            if (providerRequests.size() >= PROVIDER_REQUESTS_PER_SECOND) throw new LocationSearchException(true);
            providerRequests.addLast(now);
        }
        var suggestions = fetchSuggestions(query);
        synchronized (cache) {
            cache.put(query, new CacheEntry(suggestions, clock.instant().plus(CACHE_TTL)));
            if (cache.size() > CACHE_CAPACITY) cache.remove(cache.keySet().iterator().next());
        }
        return suggestions;
    }

    @Override
    public Optional<ReverseLocationResponse> reverse(String latitude, String longitude) {
        if (latitude == null || longitude == null || latitude.isBlank() || longitude.isBlank()) {
            throw new InvalidLocationQueryException();
        }
        double lat;
        double lon;
        try {
            lat = Double.parseDouble(latitude.trim());
            lon = Double.parseDouble(longitude.trim());
        } catch (NumberFormatException e) {
            throw new InvalidLocationQueryException();
        }
        if (!Double.isFinite(lat) || !Double.isFinite(lon) || lat < -90.0 || lat > 90.0 || lon < -180.0 || lon > 180.0) {
            throw new InvalidLocationQueryException();
        }
        if (apiKey == null || apiKey.isBlank()) throw new LocationSearchException(false);

        String cacheKey = "rev:" + lat + "," + lon;
        synchronized (cache) {
            Instant now = clock.instant();
            cache.values().removeIf(entry -> !entry.expiresAt().isAfter(now));
            var cached = cache.get(cacheKey);
            if (cached != null) {
                @SuppressWarnings("unchecked")
                var result = (Optional<ReverseLocationResponse>) cached.value();
                return result;
            }
            Instant windowStart = now.minusSeconds(1);
            while (!providerRequests.isEmpty() && !providerRequests.peekFirst().isAfter(windowStart)) {
                providerRequests.removeFirst();
            }
            if (providerRequests.size() >= PROVIDER_REQUESTS_PER_SECOND) throw new LocationSearchException(true);
            providerRequests.addLast(now);
        }

        var result = fetchReverse(latitude.trim(), longitude.trim());
        synchronized (cache) {
            cache.put(cacheKey, new CacheEntry(result, clock.instant().plus(CACHE_TTL)));
            if (cache.size() > CACHE_CAPACITY) cache.remove(cache.keySet().iterator().next());
        }
        return result;
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

    private Optional<ReverseLocationResponse> fetchReverse(String latStr, String lonStr) {
        try {
            var uri = UriComponentsBuilder.fromUriString(baseUrl).path("/v1/geocode/reverse")
                    .queryParam("lat", latStr).queryParam("lon", lonStr)
                    .queryParam("apiKey", apiKey)
                    .queryParam("format", "json")
                    .queryParam("lang", "vi").queryParam("limit", 1).build().encode().toUri();
            var response = client.send(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(3)).GET().build(),
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new LocationSearchException(response.statusCode() == 429);
            var root = mapper.readTree(response.body());
            if (root == null || root.isNull()) throw new LocationSearchException(false);
            var results = root.get("results");
            if (results == null || !results.isArray()) throw new LocationSearchException(false);
            if (results.isEmpty()) return Optional.empty();
            var first = results.get(0);
            if (first == null || !first.isObject()) return Optional.empty();
            var formatted = first.get("formatted");
            if (formatted == null || !formatted.isTextual() || formatted.asText().isBlank()) {
                return Optional.empty();
            }
            return Optional.of(new ReverseLocationResponse(formatted.asText().trim()));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new LocationSearchException(false);
        } catch (IOException | IllegalArgumentException exception) {
            // Provider exceptions and URIs can contain the private API key; never retain or log them.
            throw new LocationSearchException(false);
        }
    }

    private record CacheEntry(Object value, Instant expiresAt) {}
}
