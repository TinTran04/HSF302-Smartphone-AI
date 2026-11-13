package com.smartphoneai.service.impl;

import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.service.support.AiFreeTierEstimates;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** Counts application-observed provider calls, independently of the rolling minute estimate. */
@Service
public class AiDailyQuotaService {
    public record Usage(long requestsToday, Long dailyRequestLimit, String dailyLimitSource,
                        Instant dailyResetAt, Instant dailyTrackingSince) {}
    private record Limit(Long value, String source) {}
    private record Window(Instant start, Instant end) {}
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final AiQuotaTracker groups;

    public AiDailyQuotaService(JdbcTemplate jdbc, Clock clock) {
        this.jdbc = jdbc;
        this.clock = clock;
        this.groups = new AiQuotaTracker(jdbc, clock);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordRequest(String provider, String model, String secret) {
        groups.lock();
        String fingerprint = AiQuotaTracker.fingerprint(secret);
        groups.group(provider, fingerprint, model, true);
        jdbc.update("INSERT INTO ai_daily_request_usage(id,provider,key_fingerprint,model,requested_at) VALUES(?,?,?,?,?)",
                UUID.randomUUID(), provider, fingerprint, model, Timestamp.from(clock.instant()));
    }

    public Usage get(String provider, String model, String fingerprint) {
        var window = window(provider);
        var group = groups.group(provider, fingerprint, model, false);
        var limit = group == null ? defaultLimit(provider, model) : limit(provider, group.id(), model);
        if (group == null) return new Usage(0, limit.value(), limit.source(), window.end(), null);
        String membership = "key_fingerprint=? OR key_fingerprint IN "
                + "(SELECT key_fingerprint FROM ai_provider_quota_keys WHERE provider=? AND project_id=?)";
        var arguments = new ArrayList<Object>(List.of(provider, model, Timestamp.from(window.start()),
                Timestamp.from(window.end()), fingerprint, provider, group.id()));
        if ("GEMINI".equals(provider)) {
            membership += " OR key_fingerprint IN (SELECT key_fingerprint FROM ai_quota_keys WHERE project_id=?)";
            arguments.add(group.id());
        }
        return jdbc.queryForObject("SELECT COUNT(*),MIN(requested_at) FROM ai_daily_request_usage "
                        + "WHERE provider=? AND model=? AND requested_at>=? AND requested_at<? AND (" + membership + ")",
                (rs, row) -> new Usage(rs.getLong(1), limit.value(), limit.source(), window.end(),
                        rs.getTimestamp(2) == null ? null : rs.getTimestamp(2).toInstant()),
                arguments.toArray());
    }

    /** Called inside the key editor transaction after its project mapping has been saved. */
    public void configure(String provider, String model, String fingerprint, Long requestedLimit, Boolean useDefault) {
        if (useDefault == null && requestedLimit == null) return;
        validate(requestedLimit);
        if (Boolean.FALSE.equals(useDefault) && requestedLimit == null) throw new InvalidAiConfigurationException();
        groups.lock();
        var group = groups.group(provider, fingerprint, model, true);
        var selected = new Limit(requestedLimit, "MANUAL");
        if (Boolean.TRUE.equals(useDefault)) {
            Long observed = observed(provider, group.id(), model, fingerprint);
            selected = observed == null ? defaultLimit(provider, model) : new Limit(observed, "PROVIDER");
        }
        saveLimit(provider, group.id(), model, selected);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void observeLimit(String provider, String model, String secret, Long requestLimit) {
        if (requestLimit == null || requestLimit <= 0 || requestLimit > 1_000_000_000L) return;
        groups.lock();
        String fingerprint = AiQuotaTracker.fingerprint(secret);
        var group = groups.group(provider, fingerprint, model, true);
        int changed = jdbc.update("UPDATE ai_daily_observed_limits SET project_id=?,request_limit=?,observed_at=? "
                        + "WHERE provider=? AND key_fingerprint=? AND model=?",
                group.id(), requestLimit, Timestamp.from(clock.instant()), provider, fingerprint, model);
        if (changed == 0)
            jdbc.update("INSERT INTO ai_daily_observed_limits(provider,key_fingerprint,project_id,model,request_limit,observed_at) "
                            + "VALUES(?,?,?,?,?,?)", provider, fingerprint, group.id(), model, requestLimit, Timestamp.from(clock.instant()));
        if (!"MANUAL".equals(limit(provider, group.id(), model).source()))
            saveLimit(provider, group.id(), model, new Limit(requestLimit, "PROVIDER"));
    }

    private Long observed(String provider, UUID groupId, String model, String fingerprint) {
        var values = jdbc.query("SELECT request_limit FROM ai_daily_observed_limits WHERE provider=? AND model=? "
                        + "AND (key_fingerprint=? OR project_id=?) ORDER BY observed_at DESC LIMIT 1",
                (rs, row) -> rs.getLong(1), provider, model, fingerprint, groupId);
        return values.isEmpty() ? null : values.getFirst();
    }

    private Limit limit(String provider, UUID groupId, String model) {
        var values = jdbc.query("SELECT request_limit,limit_source FROM ai_daily_request_limits "
                        + "WHERE provider=? AND project_id=? AND model=?",
                (rs, row) -> new Limit(rs.getLong(1), rs.getString(2)), provider, groupId, model);
        return values.isEmpty() ? defaultLimit(provider, model) : values.getFirst();
    }

    private void saveLimit(String provider, UUID groupId, String model, Limit limit) {
        if (limit.value() == null) {
            jdbc.update("DELETE FROM ai_daily_request_limits WHERE provider=? AND project_id=? AND model=?", provider, groupId, model);
            return;
        }
        int changed = jdbc.update("UPDATE ai_daily_request_limits SET request_limit=?,limit_source=? "
                        + "WHERE provider=? AND project_id=? AND model=?", limit.value(), limit.source(), provider, groupId, model);
        if (changed == 0)
            jdbc.update("INSERT INTO ai_daily_request_limits(provider,project_id,model,request_limit,limit_source) VALUES(?,?,?,?,?)",
                    provider, groupId, model, limit.value(), limit.source());
    }

    private static Limit defaultLimit(String provider, String model) {
        Long value = "GEMINI".equals(provider)
                ? AiFreeTierEstimates.gemini(model).map(item -> item.requestsPerDay()).orElse(null) : null;
        return new Limit(value, value == null ? "NONE" : "DEFAULT");
    }

    private Window window(String provider) {
        ZoneId zone = ZoneId.of("GEMINI".equals(provider) ? "America/Los_Angeles" : "UTC");
        var date = clock.instant().atZone(zone).toLocalDate();
        return new Window(date.atStartOfDay(zone).toInstant(), date.plusDays(1).atStartOfDay(zone).toInstant());
    }

    public static void validate(Long limit) {
        if (limit != null && (limit <= 0 || limit > 1_000_000_000L)) throw new InvalidAiConfigurationException();
    }
}
