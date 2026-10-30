package com.smartphoneai.service;

import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.dto.request.UpdateProfileRequest;
import com.smartphoneai.repository.UserAccountRepository;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.exception.InvalidPasswordException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    public UserService(UserAccountRepository users, PasswordEncoder passwords) { this.users = users; this.passwords = passwords; }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findActiveUser(String id) {
        try {
            return users.findById(UUID.fromString(id)).filter(u -> u.isActive()).map(UserResponse::from);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
    @Transactional
    public void changePassword(String id, String currentPassword, String newPassword) {
        if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        var user = users.findLockedById(UUID.fromString(id)).filter(u -> u.isActive())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwords.matches(currentPassword, user.getPasswordHash())) throw new InvalidCredentialsException();
        user.changePasswordHash(passwords.encode(newPassword));
    }
    @Transactional
    public UserResponse updateProfile(String id, UpdateProfileRequest input) {
        var user = users.findLockedById(UUID.fromString(id)).filter(u -> u.isActive())
                .orElseThrow(InvalidCredentialsException::new);
        user.updateProfile(input.fullName(), input.phone(), input.address());
        return UserResponse.from(user);
    }
}
