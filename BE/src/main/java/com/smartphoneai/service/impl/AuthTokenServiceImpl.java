package com.smartphoneai.service.impl;

import com.smartphoneai.config.AccountPrincipal;
import com.smartphoneai.config.JwtConfig;
import com.smartphoneai.entity.RefreshSession;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.repository.RefreshSessionRepository;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthTokenServiceImpl implements AuthTokenService {
    public static final String ACCESS_COOKIE = "SPAI_ACCESS";
    public static final String REFRESH_COOKIE = "SPAI_REFRESH";
    private static final Duration ACCESS_TTL = Duration.ofMinutes(15);
    private static final Duration REFRESH_TTL = Duration.ofDays(7);
    private final UserAccountRepository users;
    private final RefreshSessionRepository sessions;
    private final UserService profiles;
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final JwtDecoder logoutDecoder;
    private final Clock clock;
    private final boolean secure;
    private final SecureRandom random = new SecureRandom();

    public AuthTokenServiceImpl(UserAccountRepository users, RefreshSessionRepository sessions, UserService profiles,
                               JwtEncoder encoder, @Qualifier("jwtDecoder") JwtDecoder decoder,
                               @Qualifier("logoutJwtDecoder") JwtDecoder logoutDecoder, Clock clock,
                               @Value("${app.auth.cookie-secure:false}") boolean secure) {
        this.users = users;
        this.sessions = sessions;
        this.profiles = profiles;
        this.encoder = encoder;
        this.decoder = decoder;
        this.logoutDecoder = logoutDecoder;
        this.clock = clock;
        this.secure = secure;
    }

    @Override
    @Transactional
    public Cookies issue(UserAccount user) {
        var current = users.findLockedById(user.getId()).filter(this::active).orElseThrow(InvalidCredentialsException::new);
        if (current.getCredentialVersion() != user.getCredentialVersion() || current.getRole() != user.getRole())
            throw new InvalidCredentialsException();
        String refresh = randomToken();
        var session = sessions.save(new RefreshSession(current, hash(refresh), clock.instant(), clock.instant().plus(REFRESH_TTL)));
        return cookies(current, session, refresh);
    }

    @Override
    @Transactional
    public Cookies refresh(HttpServletRequest request) {
        String raw = cookie(request, REFRESH_COOKIE).orElseThrow(InvalidCredentialsException::new);
        String tokenHash = hash(raw);
        var candidate = sessions.findIdentityByTokenHash(tokenHash).orElseThrow(InvalidCredentialsException::new);
        // Every renewal takes the account lock before the device lock, as password changes do.
        var user = users.findLockedById(candidate.getUserId()).filter(this::active).orElseThrow(InvalidCredentialsException::new);
        var session = sessions.findLockedById(candidate.getId()).orElseThrow(InvalidCredentialsException::new);
        if (!valid(session, user) || !MessageDigest.isEqual(tokenHash.getBytes(StandardCharsets.US_ASCII),
                session.getTokenHash().getBytes(StandardCharsets.US_ASCII))) throw new InvalidCredentialsException();
        return rotate(user, session);
    }

    @Override
    @Transactional
    public Cookies logout(HttpServletRequest request) {
        cookie(request, REFRESH_COOKIE).flatMap(raw -> sessions.findIdentityByTokenHash(hash(raw)))
                .flatMap(session -> sessions.findLockedById(session.getId()))
                .ifPresent(RefreshSession::revoke);
        cookie(request, ACCESS_COOKIE).flatMap(this::logoutIdentity).ifPresent(identity ->
                sessions.findLockedById(identity.sessionId()).filter(session -> session.getUserId().equals(identity.id()))
                        .ifPresent(RefreshSession::revoke));
        return new Cookies(List.of(cookieHeader(ACCESS_COOKIE, "", "/api", Duration.ZERO),
                cookieHeader(REFRESH_COOKIE, "", "/api/auth", Duration.ZERO)));
    }

    @Override
    @Transactional
    public Cookies changePassword(AccountPrincipal principal, String currentPassword, String newPassword) {
        var user = users.findLockedById(principal.id()).filter(this::active).orElseThrow(InvalidCredentialsException::new);
        if (principal.credentialVersion() != user.getCredentialVersion() || principal.sessionId() == null)
            throw new InvalidCredentialsException();
        var session = sessions.findLockedById(principal.sessionId()).orElseThrow(InvalidCredentialsException::new);
        if (!valid(session, user)) throw new InvalidCredentialsException();
        profiles.changePassword(principal.getName(), currentPassword, newPassword);
        return rotate(user, session);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Authentication> authenticate(String accessToken) {
        try {
            var jwt = decoder.decode(accessToken);
            UUID userId = UUID.fromString(jwt.getSubject());
            UUID sessionId = UUID.fromString(jwt.getClaimAsString("sid"));
            Number credentialVersion = jwt.getClaim("cv");
            var role = UserAccount.Role.valueOf(jwt.getClaimAsString("role"));
            var user = users.findById(userId).orElse(null);
            var session = sessions.findById(sessionId).orElse(null);
            if (user == null || session == null || credentialVersion == null || !active(user) || !valid(session, user)
                    || credentialVersion.longValue() != user.getCredentialVersion() || role != user.getRole()) return Optional.empty();
            return Optional.of(UsernamePasswordAuthenticationToken.authenticated(
                    new AccountPrincipal(userId, user.getCredentialVersion(), sessionId), null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))));
        } catch (JwtException | IllegalArgumentException | ClassCastException exception) {
            return Optional.empty();
        }
    }

    private Optional<AccountPrincipal> logoutIdentity(String token) {
        try {
            var jwt = logoutDecoder.decode(token);
            return Optional.of(new AccountPrincipal(UUID.fromString(jwt.getSubject()), 0, UUID.fromString(jwt.getClaimAsString("sid"))));
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }
    private boolean active(UserAccount user) {
        return user.isActive() && !user.isDeleted() && !user.isDisabled();
    }
    private boolean valid(RefreshSession session, UserAccount user) {
        return !session.isRevoked() && session.getUserId().equals(user.getId()) && session.getExpiresAt().isAfter(clock.instant())
                && session.getCredentialVersion() == user.getCredentialVersion() && session.getRole() == user.getRole();
    }
    private Cookies rotate(UserAccount user, RefreshSession session) {
        String raw = randomToken();
        session.rotate(user, hash(raw), clock.instant().plus(REFRESH_TTL));
        return cookies(user, session, raw);
    }
    private Cookies cookies(UserAccount user, RefreshSession session, String refresh) {
        var now = clock.instant();
        var claims = JwtClaimsSet.builder().issuer(JwtConfig.ISSUER).audience(List.of(JwtConfig.AUDIENCE))
                .subject(user.getId().toString()).issuedAt(now).expiresAt(now.plus(ACCESS_TTL))
                .claim("sid", session.getId().toString()).claim("cv", user.getCredentialVersion()).claim("role", user.getRole().name()).build();
        String access = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new Cookies(List.of(cookieHeader(ACCESS_COOKIE, access, "/api", ACCESS_TTL),
                cookieHeader(REFRESH_COOKIE, refresh, "/api/auth", REFRESH_TTL)));
    }
    private String cookieHeader(String name, String value, String path, Duration maxAge) {
        return ResponseCookie.from(name, value).path(path).httpOnly(true)
                .sameSite("Strict").secure(secure).maxAge(maxAge).build().toString();
    }
    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    private String hash(String raw) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
    public static Optional<String> cookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        for (var cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) return Optional.of(cookie.getValue());
        }
        return Optional.empty();
    }
}
