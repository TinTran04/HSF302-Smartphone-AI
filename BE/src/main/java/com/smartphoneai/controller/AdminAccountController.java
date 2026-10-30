package com.smartphoneai.controller;

import com.smartphoneai.dto.request.AdminInvitationRequest;
import com.smartphoneai.dto.request.ChangeAdminRoleRequest;
import com.smartphoneai.exception.ProtectedAccountException;
import com.smartphoneai.service.AdminManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminAccountController {
    private final AdminManagementService admins;
    public AdminAccountController(AdminManagementService admins) { this.admins = admins; }
    @GetMapping("/admins") public Object list() { return admins.list(); }
    @PostMapping("/admin-invitations")
    public ResponseEntity<?> invite(@Valid @RequestBody AdminInvitationRequest input) {
        return ResponseEntity.accepted().body(admins.invite(input));
    }
    @PostMapping("/admin-invitations/{id}/resend")
    public ResponseEntity<?> resend(@PathVariable UUID id) { return ResponseEntity.accepted().body(admins.resend(id)); }
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        admins.deleteAdmin(UUID.fromString(auth.getName()), id); return ResponseEntity.noContent().build();
    }
    @PatchMapping("/admins/{id}/role")
    public Object demote(@PathVariable UUID id, Authentication auth, @Valid @RequestBody ChangeAdminRoleRequest input) {
        if (!"CUSTOMER".equals(input.role())) throw new ProtectedAccountException();
        return admins.demoteAdmin(UUID.fromString(auth.getName()), id);
    }
}
