package com.smartphoneai.config;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

public record AccountPrincipal(UUID id, long credentialVersion, UUID sessionId) implements Principal, Serializable {
    public AccountPrincipal(UUID id) { this(id, 0, null); }
    public AccountPrincipal(UUID id, long credentialVersion) { this(id, credentialVersion, null); }
    @Override public String getName() { return id.toString(); }
}
