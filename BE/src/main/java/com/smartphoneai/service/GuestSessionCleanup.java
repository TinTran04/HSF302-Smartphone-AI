package com.smartphoneai.service;

import com.smartphoneai.repository.AiGuestSessionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;

@Service
public class GuestSessionCleanup {
    private final AiGuestSessionRepository guests;
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public GuestSessionCleanup(AiGuestSessionRepository guests, JdbcTemplate jdbc, Clock clock) {
        this.guests = guests; this.jdbc = jdbc; this.clock = clock;
    }
    @Scheduled(fixedDelayString = "${app.guest-cleanup.delay-ms:3600000}", initialDelayString = "${app.guest-cleanup.delay-ms:3600000}")
    @Transactional
    public void removeExpired() {
        for (var guest : guests.findExpiredLocked(clock.instant(), PageRequest.of(0, 100))) {
            var id = guest.getId();
            jdbc.update("DELETE FROM ai_topic_switch_requests WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE guest_id = ?)", id);
            jdbc.update("DELETE FROM ai_messages WHERE conversation_id IN (SELECT id FROM ai_conversations WHERE guest_id = ?)", id);
            jdbc.update("DELETE FROM ai_conversations WHERE guest_id = ?", id);
            jdbc.update("DELETE FROM ai_guest_sessions WHERE id = ?", id);
        }
    }
}
