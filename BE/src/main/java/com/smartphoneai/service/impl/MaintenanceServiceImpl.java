package com.smartphoneai.service.impl;

import com.smartphoneai.service.MaintenanceService;

import com.smartphoneai.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MaintenanceServiceImpl implements MaintenanceService {
    private final SystemSettingRepository settings;
    public MaintenanceServiceImpl(SystemSettingRepository settings) { this.settings = settings; }
    @Override
    @Transactional(readOnly = true)
    public boolean isEnabled() { return settings.findById(1).orElseThrow().isMaintenanceEnabled(); }
    @Override
    @Transactional
    public boolean setEnabled(boolean enabled) {
        var setting = settings.findLockedSingleton().orElseThrow();
        setting.setMaintenanceEnabled(enabled);
        return enabled;
    }
}
