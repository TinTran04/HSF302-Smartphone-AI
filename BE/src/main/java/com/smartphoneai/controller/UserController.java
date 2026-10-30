package com.smartphoneai.controller;

import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.service.UserService;
import com.smartphoneai.dto.request.ChangePasswordRequest;
import com.smartphoneai.dto.request.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        return ResponseEntity.of(users.findActiveUser(auth.getName()));
    }
    @PutMapping("/me")
    public UserResponse update(Authentication auth, @Valid @RequestBody UpdateProfileRequest input) {
        return users.updateProfile(auth.getName(), input);
    }
    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication auth, @Valid @RequestBody ChangePasswordRequest input) {
        users.changePassword(auth.getName(), input.currentPassword(), input.newPassword());
        return ResponseEntity.noContent().build();
    }
}
