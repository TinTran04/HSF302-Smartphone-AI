package com.smartphoneai.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_settings")
public class SystemSetting {
    @Id private int id;
    @Column(name = "maintenance_enabled", nullable = false) private boolean maintenanceEnabled;
    @Version private long version;
    protected SystemSetting() {}
    public boolean isMaintenanceEnabled() { return maintenanceEnabled; }
    public void setMaintenanceEnabled(boolean enabled) { maintenanceEnabled = enabled; }
}
