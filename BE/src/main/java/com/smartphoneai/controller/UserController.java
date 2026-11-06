package com.smartphoneai.controller;

import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.service.UserService;
import com.smartphoneai.service.AuthTokenService;
import com.smartphoneai.dto.request.ChangePasswordRequest;
import com.smartphoneai.dto.request.UpdateProfileRequest;
import com.smartphoneai.config.AccountPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    private final AuthTokenService tokens;
    public UserController(UserService users, AuthTokenService tokens) { this.users = users; this.tokens = tokens; }
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        return ResponseEntity.of(users.findActiveUser(auth.getName()));
    }
    @PutMapping("/me")
    public UserResponse update(Authentication auth, @Valid @RequestBody UpdateProfileRequest input) {
        return users.updateProfile(auth.getName(), input);
    }
    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest input,
                                             HttpServletRequest request, HttpServletResponse response) {
        tokens.changePassword((AccountPrincipal) auth.getPrincipal(), input.currentPassword(), input.newPassword()).writeTo(response);
        return ResponseEntity.noContent().build();
    }
}
