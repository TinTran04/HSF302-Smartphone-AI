package com.smartphoneai.ai;

import com.smartphoneai.service.GuestSessionCleanup;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.jdbc.core.JdbcTemplate;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Import({GuestSessionCleanup.class, GuestSessionCleanupIntegrationTest.ClockConfig.class})
class GuestSessionCleanupIntegrationTest {
    @TestConfiguration static class ClockConfig { @Bean Clock clock() { return Clock.fixed(Instant.parse("2026-01-03T00:00:00Z"), ZoneOffset.UTC); } }
    @Autowired GuestSessionCleanup cleanup;
    @Autowired JdbcTemplate jdbc;

    @Test void removesOnlyExpiredGuestDataAndPreservesClaimedAndActiveConversations() {
        UUID expired = UUID.randomUUID(), active = UUID.randomUUID(), customer = UUID.randomUUID();
        UUID guestChat = UUID.randomUUID(), activeChat = UUID.randomUUID(), claimedChat = UUID.randomUUID();
        Instant now = Instant.parse("2026-01-03T00:00:00Z");
        session(expired, "e".repeat(64), now.minusSeconds(1));
        session(active, "a".repeat(64), now.plusSeconds(60));
        jdbc.update("INSERT INTO users (id,email,password_hash,full_name,phone,address,role,active,deleted,version) VALUES (?,?,?,?,?,?,?,?,?,0)", customer,"claim@example.com","x","Customer","","","CUSTOMER",true,false);
        conversation(guestChat, null, expired, now);
        conversation(activeChat, null, active, now);
        conversation(claimedChat, customer, null, now);
        jdbc.update("INSERT INTO ai_messages (conversation_id,role,content,sources_json,recommendations_json,comparisons_json,created_at) VALUES (?,?,?,?,?,?,?)", guestChat,"user","question","[]","[]","[]",Timestamp.from(now));
        jdbc.update("INSERT INTO ai_topic_switch_requests (id,conversation_id,suggested_topic,question,status,expires_at,version) VALUES (?,?,?,?,?,?,0)", UUID.randomUUID(),guestChat,"GENERAL_CHAT","question","PENDING",Timestamp.from(now));
        cleanup.removeExpired();
        assertEquals(0, count("ai_guest_sessions", expired));
        assertEquals(0, count("ai_conversations", guestChat));
        assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM ai_messages WHERE conversation_id = ?", Integer.class, guestChat));
        assertEquals(0, jdbc.queryForObject("SELECT count(*) FROM ai_topic_switch_requests WHERE conversation_id = ?", Integer.class, guestChat));
        assertEquals(1, count("ai_guest_sessions", active));
        assertEquals(1, count("ai_conversations", activeChat));
        assertEquals(1, count("ai_conversations", claimedChat));
    }
    private void session(UUID id, String hash, Instant expiry) {
        jdbc.update("INSERT INTO ai_guest_sessions (id,token_hash,created_at,expires_at,message_count,revoked,version) VALUES (?,?,?,?,0,false,0)", id,hash,Timestamp.from(expiry.minusSeconds(86400)),Timestamp.from(expiry));
    }
    private void conversation(UUID id, UUID user, UUID guest, Instant now) {
        jdbc.update("INSERT INTO ai_conversations (id,user_id,guest_id,topic,title,created_at,product_ids,version) VALUES (?,?,?,?,?,?,?,0)", id,user,guest,"GENERAL_CHAT","chat",Timestamp.from(now),"[]");
    }
    private int count(String table, UUID id) { return jdbc.queryForObject("SELECT count(*) FROM " + table + " WHERE id = ?", Integer.class, id); }
}
