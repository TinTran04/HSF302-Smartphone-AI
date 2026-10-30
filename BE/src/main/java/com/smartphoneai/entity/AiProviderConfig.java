package com.smartphoneai.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="ai_provider_configs")
public class AiProviderConfig {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String provider;
    @Column(nullable=false) private String model;
    @Column(name="key_cipher", columnDefinition="text", nullable=false) private String keyCipher;
    @Column(nullable=false) private boolean tested;
    @Column(nullable=false) private boolean active;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Version private long version;
    protected AiProviderConfig() {}
    public AiProviderConfig(String provider, String model, String keyCipher, Instant now) {
        this.provider=provider; this.model=model; this.keyCipher=keyCipher; this.createdAt=now;
    }
    public Long getId() { return id; } public String getProvider() { return provider; }
    public String getModel() { return model; } public String getKeyCipher() { return keyCipher; }
    public boolean isTested() { return tested; } public boolean isActive() { return active; }
    public void markTested() { tested=true; } public void setActive(boolean active) { this.active=active; }
}
