package com.smartphoneai.controller;

import com.smartphoneai.service.impl.AiQuotaSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai-settings/quota")
public class AiQuotaSettingsController {
    private final AiQuotaSettingsService quota;
    public AiQuotaSettingsController(AiQuotaSettingsService quota) { this.quota=quota; }
    @GetMapping public AiQuotaSettingsService.Settings get(@RequestParam(defaultValue="GEMINI") String provider,
                                                          @RequestParam(required=false) String model) {
        return quota.get(provider, model);
    }
    @PutMapping public AiQuotaSettingsService.Settings save(@Valid @RequestBody AiQuotaSettingsService.SaveInput input) {
        return quota.save(input);
    }
}
