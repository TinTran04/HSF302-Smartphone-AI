package com.smartphoneai.service.impl;

import com.smartphoneai.exception.AiProviderException;
import com.smartphoneai.service.support.AiFreeTierEstimates;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiQuotaTracker {
    public record Key(String reference, String fingerprint) {}
    public record Reservation(String reference, UUID usageId, String project, boolean proactive) {}
    public record Group(UUID id, String name, Long limit, String source) {}
    public record State(String status, String reason, Instant checkedAt, Instant retryAt, Instant lastUsedAt) {
        public boolean blocked() { return Set.of("RATE_LIMIT", "AUTH_ERROR", "MODEL_ERROR", "BALANCE_ERROR").contains(status); }
    }
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final AtomicLong cleanCounter = new AtomicLong();
    public AiQuotaTracker(JdbcTemplate jdbc, Clock clock) { this.jdbc = jdbc; this.clock = clock; }
    public boolean configured() { return true; }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Reservation reserve(List<Key> keys, String model, String prompt, Set<String> excludedProjects) {
        return reserve("GEMINI", keys, model, prompt, excludedProjects);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Reservation reserve(String provider, List<Key> keys, String model, String prompt, Set<String> excludedProjects) {
        lock();
        if (keys.isEmpty()) return null;
        if (cleanCounter.incrementAndGet() % 1000 == 0)
            jdbc.update("DELETE FROM ai_quota_usage WHERE created_at < ?", timestamp(clock.instant().minusSeconds(86400)));
        var groups = new HashMap<String, Group>();
        var candidates = new ArrayList<QuotaRotationPolicy.Candidate>();
        for (var key : keys) {
            var group = group(provider, key.fingerprint(), model, true);
            groups.put(key.reference(), group);
            if (excludedProjects.contains(group.id().toString()) || (group.name() != null && excludedProjects.contains(group.name()))
                    || state(provider, model, key.fingerprint()).blocked()) continue;
            candidates.add(new QuotaRotationPolicy.Candidate(key.reference(), group.id().toString(),
                    group.limit() == null ? 0 : group.limit(), used(group.id(), model)));
        }
        if (candidates.isEmpty()) return null;
        String chosen = QuotaRotationPolicy.order(candidates).getFirst();
        var group = groups.get(chosen);
        UUID usageId = UUID.randomUUID();
        long estimate = Math.max(1, prompt.getBytes(StandardCharsets.UTF_8).length);
        jdbc.update("INSERT INTO ai_quota_usage(id,project_id,model,input_tokens,created_at) VALUES(?,?,?,?,?)",
                usageId, group.id(), model, estimate, timestamp(clock.instant()));
        return new Reservation(chosen, usageId, group.name() == null ? group.id().toString() : group.name(), !chosen.equals(keys.getFirst().reference()));
    }

    public long used(UUID projectId, String model) {
        Long value = jdbc.queryForObject("SELECT COALESCE(SUM(input_tokens),0) FROM ai_quota_usage "
                + "WHERE project_id=? AND model=? AND created_at>=?", Long.class, projectId, model,
                timestamp(clock.instant().minusSeconds(60)));
        return value == null ? 0 : value;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void finish(UUID usageId, Integer inputTokens) {
        if (usageId != null && inputTokens != null && inputTokens >= 0)
            jdbc.update("UPDATE ai_quota_usage SET input_tokens=? WHERE id=?", inputTokens.longValue(), usageId);
    }

    /** Caller holds the quota lock while creating or changing a group. */
    public Group group(String provider, String fingerprint, String model, boolean create) {
        var ids = jdbc.query("SELECT project_id FROM ai_provider_quota_keys WHERE provider=? AND key_fingerprint=?",
                (rs, n) -> rs.getObject(1, UUID.class), provider, fingerprint);
        if (ids.isEmpty() && "GEMINI".equals(provider))
            ids = jdbc.query("SELECT project_id FROM ai_quota_keys WHERE key_fingerprint=?",
                    (rs, n) -> rs.getObject(1, UUID.class), fingerprint);
        if (ids.isEmpty()) {
            if (!create) return null;
            UUID id = findOrCreateGroup(provider + ":key:" + fingerprint);
            jdbc.update("INSERT INTO ai_provider_quota_keys(provider,key_fingerprint,project_id) VALUES(?,?,?)", provider, fingerprint, id);
            ids = List.of(id);
        }
        UUID id = ids.getFirst();
        String name = jdbc.queryForObject("SELECT project_name FROM ai_quota_projects WHERE id=?", String.class, id);
        var limits = jdbc.query("SELECT tpm_limit,limit_source FROM ai_quota_project_limits WHERE project_id=? AND model=?",
                (rs, n) -> new Group(id, displayGroup(provider, name), rs.getLong(1), rs.getString(2)), id, model);
        if (!limits.isEmpty()) return limits.getFirst();
        Long fallback = defaultLimit(provider, model);
        return new Group(id, displayGroup(provider, name), fallback, fallback == null ? "NONE" : "DEFAULT");
    }

    public static Long defaultLimit(String provider, String model) {
        return "GEMINI".equals(provider) ? AiFreeTierEstimates.gemini(model).map(limit -> limit.tokensPerMinute()).orElse(null) : null;
    }

    public void lock() { jdbc.queryForObject("SELECT id FROM ai_quota_lock WHERE id=1 FOR UPDATE", Integer.class); }

    public void configure(String provider, String fingerprint, String model, String projectName, Long limit, String source) {
        lock();
        String internal = projectName == null ? provider + ":key:" + fingerprint
                : "GEMINI".equals(provider) ? projectName : provider + ":" + projectName;
        UUID id = findOrCreateGroup(internal);
        int updated = jdbc.update("UPDATE ai_provider_quota_keys SET project_id=? WHERE provider=? AND key_fingerprint=?", id, provider, fingerprint);
        if (updated == 0)
            jdbc.update("INSERT INTO ai_provider_quota_keys(provider,key_fingerprint,project_id) VALUES(?,?,?)", provider, fingerprint, id);
        if ("GEMINI".equals(provider)) {
            jdbc.update("DELETE FROM ai_quota_keys WHERE key_fingerprint=?", fingerprint);
            jdbc.update("INSERT INTO ai_quota_keys(key_fingerprint,project_id) VALUES(?,?)", fingerprint, id);
        }
        if (limit == null) jdbc.update("DELETE FROM ai_quota_project_limits WHERE project_id=? AND model=?", id, model);
        else {
            int changed = jdbc.update("UPDATE ai_quota_project_limits SET tpm_limit=?,limit_source=? WHERE project_id=? AND model=?", limit, source, id, model);
            if (changed == 0)
                jdbc.update("INSERT INTO ai_quota_project_limits(project_id,model,tpm_limit,limit_source) VALUES(?,?,?,?)", id, model, limit, source);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void observeLimit(String provider, String fingerprint, String model, Long limit) {
        if (limit == null || limit <= 0) return;
        lock();
        int changed = jdbc.update("UPDATE ai_observed_quota_limits SET tpm_limit=?,observed_at=? WHERE provider=? AND key_fingerprint=? AND model=?",
                limit,timestamp(clock.instant()),provider,fingerprint,model);
        if (changed==0) jdbc.update("INSERT INTO ai_observed_quota_limits(provider,key_fingerprint,model,tpm_limit,observed_at) VALUES(?,?,?,?,?)",
                provider,fingerprint,model,limit,timestamp(clock.instant()));
        var group = group(provider, fingerprint, model, true);
        if (!"MANUAL".equals(group.source())) configure(provider, fingerprint, model, group.name(), limit, "PROVIDER");
    }

    public Long observedLimit(String provider,String fingerprint,String model) {
        var group=group(provider,fingerprint,model,false);
        UUID groupId=group==null?new UUID(0,0):group.id();
        String shared="key_fingerprint IN (SELECT key_fingerprint FROM ai_provider_quota_keys WHERE provider=? AND project_id=?)";
        var arguments=new ArrayList<Object>(List.of(provider,model,fingerprint,provider,groupId));
        if ("GEMINI".equals(provider)) {
            shared += " OR key_fingerprint IN (SELECT key_fingerprint FROM ai_quota_keys WHERE project_id=?)";
            arguments.add(groupId);
        }
        var values=jdbc.query("SELECT tpm_limit FROM ai_observed_quota_limits WHERE provider=? AND model=? AND (key_fingerprint=? OR "
                + shared + ") ORDER BY observed_at DESC LIMIT 1",(rs,row)->rs.getLong(1),arguments.toArray());
        return values.isEmpty()?null:values.getFirst();
    }

    public State state(String provider, String model, String fingerprint) {
        var group = group(provider, fingerprint, model, false);
        var subjects = new ArrayList<String>();
        subjects.add("KEY:" + fingerprint);
        if (group != null) subjects.add("GROUP:" + group.id());
        var states = new ArrayList<State>();
        for (String subject : subjects)
            states.addAll(jdbc.query("SELECT status,reason,checked_at,retry_at,last_used_at FROM ai_quota_status "
                    + "WHERE provider=? AND subject=? AND (model=? OR model='*')",
                    (rs, n) -> new State(rs.getString(1), rs.getString(2), instant(rs.getTimestamp(3)),
                            instant(rs.getTimestamp(4)), instant(rs.getTimestamp(5))), provider, subject, model));
        Instant lastUsed = states.stream().map(State::lastUsedAt).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null);
        var blocked = states.stream().filter(State::blocked)
                .filter(item -> item.retryAt() == null || clock.instant().isBefore(item.retryAt()))
                .max(Comparator.comparing(State::checkedAt));
        if (blocked.isPresent()) {
            var value = blocked.get();
            return new State(value.status(), value.reason(), value.checkedAt(), value.retryAt(), lastUsed);
        }
        return states.stream().max(Comparator.comparing(State::checkedAt))
                .map(value -> new State(value.blocked() ? "RETRY_READY" : value.status(), value.reason(), value.checkedAt(), value.retryAt(), lastUsed))
                .orElse(new State("UNKNOWN", null, null, null, null));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailure(String provider, String model, String fingerprint, AiProviderException error) {
        lock();
        var group = group(provider, fingerprint, model, true);
        String subject = error.isQuotaExceeded() ? "GROUP:" + group.id() : "KEY:" + fingerprint;
        String scopeModel = error.isBalanceFailure() || error.isAuthenticationFailure() ? "*" : model;
        String status = error.isBalanceFailure() ? "BALANCE_ERROR" : error.isQuotaExceeded() ? "RATE_LIMIT"
                : error.isAuthenticationFailure() ? "AUTH_ERROR" : error.isModelFailure() ? "MODEL_ERROR" : "PROVIDER_ERROR";
        Instant retryAt = error.getRetryAfterSeconds() == null ? null : clock.instant().plusSeconds(error.getRetryAfterSeconds());
        if ("PROVIDER_ERROR".equals(status)) {
            var existing=state(provider,model,fingerprint);
            if(existing.blocked()) return;
        }
        writeState(provider, subject, scopeModel, status, error.isBalanceFailure()?"AI_PROVIDER_BALANCE_ERROR":error.getQuotaReason(), retryAt, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordSuccess(String provider, String model, String fingerprint, boolean used) {
        lock();
        var group = group(provider, fingerprint, model, true);
        for (String subject : List.of("KEY:" + fingerprint, "GROUP:" + group.id()))
            for (String scopeModel : List.of(model, "*"))
                jdbc.update("UPDATE ai_quota_status SET status='WORKING',reason=NULL,retry_at=NULL,checked_at=? "
                        + "WHERE provider=? AND subject=? AND model=?" + (used ? " AND retry_at IS NOT NULL AND retry_at<=?" : ""),
                        used ? new Object[]{timestamp(clock.instant()),provider,subject,scopeModel,timestamp(clock.instant())}
                                : new Object[]{timestamp(clock.instant()),provider,subject,scopeModel});
        if (used && state(provider,model,fingerprint).blocked()) {
            int updated = jdbc.update("UPDATE ai_quota_status SET last_used_at=? WHERE provider=? AND subject=? AND model=?",
                    timestamp(clock.instant()),provider,"KEY:"+fingerprint,model);
            if (updated==0) writeState(provider,"KEY:"+fingerprint,model,"WORKING",null,null,clock.instant());
            return;
        }
        writeState(provider, "KEY:" + fingerprint, model, "WORKING", null, null, used ? clock.instant() : null);
    }

    private void writeState(String provider, String subject, String model, String status, String reason, Instant retryAt, Instant lastUsed) {
        int updated = jdbc.update("UPDATE ai_quota_status SET status=?,reason=?,checked_at=?,retry_at=?,"
                + "last_used_at=COALESCE(?,last_used_at) WHERE provider=? AND subject=? AND model=?",
                status, reason, timestamp(clock.instant()), timestamp(retryAt), timestamp(lastUsed), provider, subject, model);
        if (updated == 0)
            jdbc.update("INSERT INTO ai_quota_status(provider,subject,model,status,reason,checked_at,retry_at,last_used_at) VALUES(?,?,?,?,?,?,?,?)",
                    provider, subject, model, status, reason, timestamp(clock.instant()), timestamp(retryAt), timestamp(lastUsed));
    }

    private UUID findOrCreateGroup(String name) {
        var found = jdbc.query("SELECT id FROM ai_quota_projects WHERE project_name=?", (rs, n) -> rs.getObject(1, UUID.class), name);
        if (!found.isEmpty()) return found.getFirst();
        UUID id = UUID.randomUUID();
        jdbc.update("INSERT INTO ai_quota_projects(id,project_name) VALUES(?,?)", id, name);
        return id;
    }
    private static String displayGroup(String provider, String name) {
        if (name == null || name.startsWith(provider + ":key:")) return null;
        return name.startsWith(provider + ":") ? name.substring(provider.length() + 1) : name;
    }
    private static Timestamp timestamp(Instant value) { return value == null ? null : Timestamp.from(value); }
    private static Instant instant(Timestamp value) { return value == null ? null : value.toInstant(); }
    public static String fingerprint(String secret) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception error) { throw new IllegalStateException(error); }
    }
}
