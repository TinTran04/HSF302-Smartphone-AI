package com.smartphoneai.controller;

import com.smartphoneai.dto.response.AiNotificationsResponse;
import com.smartphoneai.service.AiKeyAlertService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ai-settings/notifications")
public class AiNotificationController {
    private final AiKeyAlertService alerts;

    public AiNotificationController(AiKeyAlertService alerts) { this.alerts = alerts; }

    public record ReadRequest(@NotNull @Min(0) Long throughId) {}

    @GetMapping
    public AiNotificationsResponse history(Authentication auth) {
        return alerts.history(UUID.fromString(auth.getName()));
    }

    @PostMapping("/read")
    public ResponseEntity<Void> markRead(Authentication auth, @Valid @RequestBody ReadRequest input) {
        alerts.markRead(UUID.fromString(auth.getName()), input.throughId());
        return ResponseEntity.noContent().build();
    }
}
