package com.smartphoneai.service.impl;

import com.smartphoneai.exception.InvalidAiConfigurationException;
import com.smartphoneai.service.support.AiProviders;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiActivityLogService {
    public record Entry(String id, String type, String model, String keyName, String maskedKey,
                         String reason, String actor, Instant createdAt) {}
    public record Page(List<Entry> items, long total, int page, int size) {}
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public AiActivityLogService(JdbcTemplate jdbc, Clock clock) { this.jdbc = jdbc; this.clock = clock; }

    @Transactional
    public void record(String provider, String model, String type, String name, String masked, String reason, String actor) {
        jdbc.update("INSERT INTO ai_activity_log(provider,model,event_type,key_name,masked_key,reason,actor,created_at) VALUES(?,?,?,?,?,?,?,?)",
                provider, model, type, name, masked, reason, actor, Timestamp.from(clock.instant()));
    }

    @Transactional(readOnly = true)
    public Page get(String provider, int page, int size) {
        if (!AiProviders.isChatProvider(provider) || page < 0 || page > 100000 || size < 1 || size > 50)
            throw new InvalidAiConfigurationException();
        String union = "SELECT 'EVENT-' || CAST(id AS VARCHAR) AS entry_id,event_type,model,key_name,masked_key,reason,actor,created_at,id AS sort_id "
                + "FROM ai_activity_log WHERE provider=? UNION ALL "
                + "SELECT 'SWAP-' || CAST(id AS VARCHAR),'PRIMARY_CHANGED','',to_name,to_masked_key,"
                + "COALESCE(from_name,'') || ' (' || COALESCE(from_masked_key,'') || ') → ' || to_name || ' (' || to_masked_key || ')',actor,changed_at,id FROM ai_key_switch_history WHERE provider=?";
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM (" + union + ") activity", Long.class, provider, provider);
        var items = jdbc.query("SELECT * FROM (" + union + ") activity ORDER BY created_at DESC,sort_id DESC,entry_id DESC LIMIT ? OFFSET ?",
                (rs, row) -> new Entry(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4),
                        rs.getString(5), rs.getString(6), rs.getString(7), rs.getTimestamp(8).toInstant()),
                provider, provider, size, (long) page * size);
        return new Page(items, count == null ? 0 : count, page, size);
    }
}
