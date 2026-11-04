package com.smartphoneai.service;

import com.smartphoneai.dto.request.AdminInvitationRequest;
import com.smartphoneai.dto.response.UserResponse;
import java.util.List;
import java.util.UUID;

public interface AdminManagementService {
    public record AdminView(UserResponse user, boolean root, boolean active, String invitationId, java.time.Instant invitationExpiresAt) {}

    public record InvitationResult(String id, java.time.Instant expiresAt) {}

    List<AdminView> list();

    InvitationResult invite(AdminInvitationRequest input);

    InvitationResult resend(UUID invitationId);

    void accept(String token, String password);

    void deleteAdmin(UUID actorId, UUID targetId);

    UserResponse demoteAdmin(UUID actorId, UUID targetId);

    UserResponse changeRole(UUID actorId, UUID targetId, String roleName);
}
