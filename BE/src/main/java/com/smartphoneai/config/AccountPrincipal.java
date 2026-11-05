package com.smartphoneai.config;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

public record AccountPrincipal(UUID id, long credentialVersion) implements Principal, Serializable {
    public AccountPrincipal(UUID id) { this(id, 0); }
    @Override public String getName() { return id.toString(); }
}
