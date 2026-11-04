package com.smartphoneai.service;

import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.dto.request.UpdateProfileRequest;
import java.util.Optional;

public interface UserService {
    Optional<UserResponse> findActiveUser(String id);

    void changePassword(String id, String currentPassword, String newPassword);

    UserResponse updateProfile(String id, UpdateProfileRequest input);
}
