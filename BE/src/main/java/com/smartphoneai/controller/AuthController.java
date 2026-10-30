package com.smartphoneai.controller;

import com.smartphoneai.dto.request.RegisterRequest;
import com.smartphoneai.dto.request.VerifyOtpRequest;
import com.smartphoneai.dto.request.ResendOtpRequest;
import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.dto.request.PasswordResetRequest;
import com.smartphoneai.dto.request.PasswordResetConfirmRequest;
import com.smartphoneai.dto.request.AcceptInvitationRequest;
import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.service.RegistrationService;
import com.smartphoneai.service.OtpChallengeService;
import com.smartphoneai.service.LoginService;
import com.smartphoneai.service.PasswordResetService;
import com.smartphoneai.service.AdminManagementService;
import com.smartphoneai.service.AiChatService;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.config.AccountPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final RegistrationService registration;
    private final OtpChallengeService otp;
    private final LoginService login;
    private final PasswordResetService passwordReset;
    private final AdminManagementService admins;
    private final AiChatService chats;
    public AuthController(RegistrationService registration, OtpChallengeService otp, LoginService login,
                          PasswordResetService passwordReset, AdminManagementService admins, AiChatService chats) {
        this.registration = registration; this.otp = otp; this.login = login; this.passwordReset = passwordReset; this.admins = admins; this.chats = chats;
    }

    @PostMapping("/admin-invitations/accept")
    public ResponseEntity<Void> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest input) {
        admins.accept(input.token(), input.password()); return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset")
    public ResponseEntity<?> passwordReset(@Valid @RequestBody PasswordResetRequest input) {
        var challenge = passwordReset.begin(input.email());
        return ResponseEntity.accepted().body(Map.of("challengeId", challenge.getId().toString(),
                "expiresAt", challenge.getIssuedAt().plusSeconds(300), "resendAfter", challenge.getIssuedAt().plusSeconds(60)));
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<?> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest input) {
        if (!passwordReset.confirm(input.challengeId(), input.code(), input.newPassword()))
            return ResponseEntity.status(409).body(Map.of("code", "INVALID_OTP", "message", "Mã không hợp lệ hoặc đã hết hạn"));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest input, HttpServletRequest request, HttpServletResponse response,
                                   @RequestHeader(value="X-Guest-Session",required=false) String guestToken) {
        var result = login.beginLogin(input);
        if (result.user() != null) {
            var claimed = chats.claim(result.user().getId(), guestToken);
            establishSession(result.user(), request, response);
            return ResponseEntity.ok(Map.of("user", UserResponse.from(result.user()), "mergedConversationIds", claimed));
        }
        var challenge = result.challenge();
        return ResponseEntity.accepted().body(Map.of("challengeId", challenge.getId().toString(),
                "expiresAt", challenge.getIssuedAt().plusSeconds(300),
                "resendAfter", challenge.getIssuedAt().plusSeconds(60)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @PostMapping("/otp/resend")
    public ResponseEntity<?> resend(@Valid @RequestBody ResendOtpRequest input) {
        if (!otp.resend(input.challengeId()))
            return ResponseEntity.status(429).body(Map.of("code", "OTP_RESEND_UNAVAILABLE", "message", "Chưa thể gửi lại mã"));
        return ResponseEntity.accepted().body(Map.of("challengeId", input.challengeId().toString()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest input) {
        var challenge = registration.register(input);
        return ResponseEntity.accepted().body(Map.of("challengeId", challenge.getId().toString(),
                "expiresAt", challenge.getIssuedAt().plusSeconds(300),
                "resendAfter", challenge.getIssuedAt().plusSeconds(60)));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verify(@Valid @RequestBody VerifyOtpRequest input, HttpServletRequest request,
                                    HttpServletResponse response, @RequestHeader(value="X-Guest-Session",required=false) String guestToken) {
        var verified = registration.verify(input.challengeId(), input.code(), input.guestCart(), guestToken).orElse(null);
        if (verified == null) return ResponseEntity.status(409).body(Map.of("code", "INVALID_OTP", "message", "Mã không hợp lệ hoặc đã hết hạn"));
        var user = verified.user();
        establishSession(user, request, response);
        return ResponseEntity.ok(Map.of("user", UserResponse.from(user), "mergedConversationIds", verified.mergedConversationIds()));
    }

    private void establishSession(UserAccount user, HttpServletRequest request, HttpServletResponse response) {
        if (request.getSession(false) != null) request.changeSessionId();
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(new AccountPrincipal(user.getId()), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))));
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);
    }
}
