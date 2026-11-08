package com.smartphoneai.dto.response;

import com.smartphoneai.dto.GeoLocation;
import com.smartphoneai.entity.UserAccount;

public record UserResponse(String id, String email, String fullName, String phone, String address, String role, GeoLocation location) {
    public UserResponse(String id, String email, String fullName, String phone, String address, String role) {
        this(id, email, fullName, phone, address, role, null);
    }
    public static UserResponse from(UserAccount user) {
        return new UserResponse(user.getId().toString(), user.getEmail(), user.getFullName(),
                user.getPhone(), user.getAddress(), user.getRole().name(),
                user.getLatitude() == null ? null : new GeoLocation(user.getLatitude(), user.getLongitude()));
    }
}
