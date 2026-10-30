package com.smartphoneai.service;

import com.smartphoneai.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceService {
    private final SystemSettingRepository settings;
    public MaintenanceService(SystemSettingRepository settings) { this.settings = settings; }
    @Transactional(readOnly = true)
    public boolean isEnabled() { return settings.findById(1).orElseThrow().isMaintenanceEnabled(); }
    @Transactional
    public boolean setEnabled(boolean enabled) {
        var setting = settings.findLockedSingleton().orElseThrow();
        setting.setMaintenanceEnabled(enabled);
        return enabled;
    }
}
