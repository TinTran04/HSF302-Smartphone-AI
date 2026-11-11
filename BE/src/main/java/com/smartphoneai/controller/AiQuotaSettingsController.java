package com.smartphoneai.controller;

import com.smartphoneai.service.impl.AiQuotaSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai-settings/quota")
public class AiQuotaSettingsController {
    private final AiQuotaSettingsService quota;
    public AiQuotaSettingsController(AiQuotaSettingsService quota) { this.quota=quota; }
    @GetMapping public AiQuotaSettingsService.Settings get() { return quota.get(); }
    @PutMapping public AiQuotaSettingsService.Settings save(@Valid @RequestBody AiQuotaSettingsService.SaveInput input) {
        return quota.save(input);
    }
}
