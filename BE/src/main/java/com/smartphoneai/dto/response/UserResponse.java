package com.smartphoneai.dto.response;

import com.smartphoneai.entity.UserAccount;

public record UserResponse(String id, String email, String fullName, String phone, String address, String role) {
    public static UserResponse from(UserAccount user) {
        return new UserResponse(user.getId().toString(), user.getEmail(), user.getFullName(),
                user.getPhone(), user.getAddress(), user.getRole().name());
    }
}
