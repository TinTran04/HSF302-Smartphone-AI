package com.smartphoneai.config;

import java.io.Serializable;
import java.security.Principal;
import java.util.UUID;

public record AccountPrincipal(UUID id) implements Principal, Serializable {
    @Override public String getName() { return id.toString(); }
}
