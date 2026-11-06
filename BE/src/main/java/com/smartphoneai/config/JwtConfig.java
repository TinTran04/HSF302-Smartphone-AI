package com.smartphoneai.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Base64;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

@Configuration
public class JwtConfig {
    public static final String ISSUER = "smartphone-ai";
    public static final String AUDIENCE = "smartphone-ai-api";

    @Bean
    SecretKeySpec jwtSigningKey(@Value("${app.auth.jwt-secret:}") String configuredSecret) {
        byte[] secret;
        if (configuredSecret.isBlank()) {
            secret = new byte[32];
            new SecureRandom().nextBytes(secret);
        } else {
            try {
                secret = Base64.getDecoder().decode(configuredSecret);
            } catch (IllegalArgumentException exception) {
                throw new IllegalStateException("JWT_SECRET must be Base64 containing at least 32 bytes");
            }
            if (secret.length < 32) throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
        }
        return new SecretKeySpec(secret, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKeySpec jwtSigningKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSigningKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKeySpec jwtSigningKey, Clock clock) {
        var timestamp = new JwtTimestampValidator(Duration.ZERO);
        timestamp.setClock(clock);
        return decoder(jwtSigningKey, new DelegatingOAuth2TokenValidator<>(timestamp, identityValidator(),
                new JwtClaimValidator<Instant>("exp", expiry -> expiry != null && expiry.isAfter(clock.instant())),
                new JwtClaimValidator<Instant>("iat", issued -> issued != null && !issued.isAfter(clock.instant()))));
    }

    // Expired credentials can identify the device to revoke, never authenticate a request.
    @Bean
    JwtDecoder logoutJwtDecoder(SecretKeySpec jwtSigningKey) {
        return decoder(jwtSigningKey, identityValidator());
    }

    private NimbusJwtDecoder decoder(SecretKeySpec key, OAuth2TokenValidator<Jwt> validator) {
        var decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        var converter = MappedJwtClaimSetConverter.withDefaults(Map.of());
        decoder.setClaimSetConverter(claims -> {
            // Validate required raw claims before Spring can coerce values or synthesize iat.
            if (!(claims.get("sub") instanceof String) || !(claims.get("sid") instanceof String)
                    || !(claims.get("role") instanceof String) || !(claims.get("cv") instanceof Long)
                    || !(claims.get("exp") instanceof java.util.Date) || !(claims.get("iat") instanceof java.util.Date))
                throw new BadJwtException("Invalid access claims");
            return converter.convert(claims);
        });
        decoder.setJwtValidator(validator);
        return decoder;
    }
    private OAuth2TokenValidator<Jwt> identityValidator() {
        return new DelegatingOAuth2TokenValidator<>(new JwtIssuerValidator(ISSUER),
                new JwtClaimValidator<java.util.List<String>>("aud", audiences -> audiences != null && audiences.contains(AUDIENCE)),
                new JwtClaimValidator<Object>("exp", expiry -> expiry != null),
                new JwtClaimValidator<Object>("iat", issued -> issued != null));
    }
}
