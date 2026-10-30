package com.smartphoneai.entity;
import jakarta.persistence.*;
@Entity @Table(name="embedding_configs")
public class EmbeddingConfig {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String provider;
    @Column(nullable=false) private String model;
    @Column(name="key_cipher",nullable=false,columnDefinition="text") private String keyCipher;
    @Column(nullable=false) private int dimensions;
    @Column(nullable=false) private boolean active;
    @Version private long version;
    protected EmbeddingConfig() {}
    public EmbeddingConfig(String provider,String model,String keyCipher,int dimensions) {
        this.provider=provider; this.model=model; this.keyCipher=keyCipher; this.dimensions=dimensions; active=true;
    }
    public Long getId() { return id; } public String getProvider() { return provider; }
    public String getModel() { return model; } public String getKeyCipher() { return keyCipher; }
    public int getDimensions() { return dimensions; } public boolean isActive() { return active; }
    public void deactivate() { active=false; } public void replaceKey(String cipher) { keyCipher=cipher; }
}
