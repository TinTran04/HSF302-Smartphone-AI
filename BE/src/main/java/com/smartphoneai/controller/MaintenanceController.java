package com.smartphoneai.controller;

import com.smartphoneai.dto.request.MaintenanceRequest;
import com.smartphoneai.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MaintenanceController {
    private final MaintenanceService maintenance;
    public MaintenanceController(MaintenanceService maintenance) { this.maintenance = maintenance; }
    @GetMapping("/maintenance") public Map<String, Boolean> status() { return Map.of("enabled", maintenance.isEnabled()); }
    @PutMapping("/admin/maintenance") public Map<String, Boolean> change(@Valid @RequestBody MaintenanceRequest request) {
        return Map.of("enabled", maintenance.setEnabled(request.enabled()));
    }
}
