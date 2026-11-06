package com.smartphoneai.service.impl;

import com.smartphoneai.service.UserService;

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
public class UserServiceImpl implements UserService {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    public UserServiceImpl(UserAccountRepository users, PasswordEncoder passwords) { this.users = users; this.passwords = passwords; }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> findActiveUser(String id) {
        try {
            return users.findById(UUID.fromString(id)).filter(u -> u.isActive() && !u.isDisabled() && !u.isDeleted())
                    .map(UserResponse::from);
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
    @Override
    @Transactional
    public long changePassword(String id, String currentPassword, String newPassword) {
        if (newPassword.getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        var user = users.findLockedById(UUID.fromString(id)).filter(u -> u.isActive() && !u.isDisabled() && !u.isDeleted())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwords.matches(currentPassword, user.getPasswordHash())) throw new InvalidCredentialsException();
        user.changePasswordHash(passwords.encode(newPassword));
        return user.getCredentialVersion();
    }
    @Override
    @Transactional
    public UserResponse updateProfile(String id, UpdateProfileRequest input) {
        var user = users.findLockedById(UUID.fromString(id)).filter(u -> u.isActive() && !u.isDisabled() && !u.isDeleted())
                .orElseThrow(InvalidCredentialsException::new);
        var location = input.location();
        user.updateProfile(input.fullName(), input.phone(), input.address(),
                location == null ? null : location.latitude(), location == null ? null : location.longitude());
        return UserResponse.from(user);
    }
}
