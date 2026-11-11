package com.smartphoneai.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiQuotaTracker {
    public record Key(String reference, String fingerprint) {}
    public record Reservation(String reference, UUID usageId, String project, boolean proactive) {}
    private record Project(UUID id, String name, long limit) {}
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final AtomicLong cleanCounter=new AtomicLong();
    public AiQuotaTracker(JdbcTemplate jdbc, Clock clock) { this.jdbc=jdbc; this.clock=clock; }

    public boolean configured() {
        Integer count=jdbc.queryForObject("SELECT COUNT(*) FROM ai_quota_keys",Integer.class);
        return count!=null && count>0;
    }

    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public Reservation reserve(List<Key> keys, String model, String prompt, Set<String> excludedProjects) {
        if (keys.isEmpty()) throw new IllegalArgumentException("No candidate keys");
        if (cleanCounter.incrementAndGet()%1000==0)
            jdbc.update("DELETE FROM ai_quota_usage WHERE created_at < ?",java.sql.Timestamp.from(clock.instant().minusSeconds(86400)));
        var projects=jdbc.query("SELECT id,project_name FROM ai_quota_projects ORDER BY id FOR UPDATE",
                (rs,n) -> {
                    var id=rs.getObject("id",UUID.class);
                    var limits=jdbc.query("SELECT tpm_limit FROM ai_quota_project_limits WHERE project_id=? AND model=?",
                            (limitRs,i)->limitRs.getLong(1),id,model);
                    return new Project(id,rs.getString("project_name"),limits.isEmpty()?0:limits.getFirst());
                });
        var byId=new HashMap<UUID,Project>(); projects.forEach(project -> byId.put(project.id(),project));
        var byKey=new HashMap<String,Project>();
        for (var key:keys) {
            var ids=jdbc.query("SELECT project_id FROM ai_quota_keys WHERE key_fingerprint=?",
                    (rs,n)->rs.getObject(1,UUID.class),key.fingerprint());
            if (!ids.isEmpty() && byId.containsKey(ids.getFirst())) byKey.put(key.reference(),byId.get(ids.getFirst()));
        }
        var usage=new HashMap<UUID,Long>();
        var since=java.sql.Timestamp.from(clock.instant().minusSeconds(60));
        for (var project:projects) {
            Long used=jdbc.queryForObject("SELECT COALESCE(SUM(input_tokens),0) FROM ai_quota_usage WHERE project_id=? AND model=? AND created_at>=?",
                    Long.class,project.id(),model,since);
            usage.put(project.id(),used==null ? 0 : used);
        }
        var candidates=new ArrayList<QuotaRotationPolicy.Candidate>();
        for (var key:keys) {
            var project=byKey.get(key.reference());
            if (project!=null && excludedProjects.contains(project.name())) continue;
            candidates.add(new QuotaRotationPolicy.Candidate(key.reference(),project==null?null:project.name(),
                    project==null?0:project.limit(),project==null?0:usage.get(project.id())));
        }
        if (candidates.isEmpty()) return null;
        String chosen=QuotaRotationPolicy.order(candidates).getFirst();
        var project=byKey.get(chosen);
        UUID usageId=null;
        if (project!=null) {
            usageId=UUID.randomUUID();
            long estimate=Math.max(1,prompt.getBytes(StandardCharsets.UTF_8).length);
            jdbc.update("INSERT INTO ai_quota_usage(id,project_id,model,input_tokens,created_at) VALUES(?,?,?,?,?)",
                    usageId,project.id(),model,estimate,java.sql.Timestamp.from(clock.instant()));
        }
        return new Reservation(chosen,usageId,project==null?null:project.name(),!chosen.equals(keys.getFirst().reference()));
    }

    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void finish(UUID usageId, Integer inputTokens) {
        if (usageId!=null && inputTokens!=null && inputTokens>0)
            jdbc.update("UPDATE ai_quota_usage SET input_tokens=? WHERE id=?",inputTokens.longValue(),usageId);
    }

    public static String fingerprint(String secret) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException(e); }
    }
}
