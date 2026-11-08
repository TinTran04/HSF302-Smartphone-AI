package com.smartphoneai.service.impl;

import com.smartphoneai.service.AdminInvitationSender;
import com.smartphoneai.service.AdminManagementService;

import com.smartphoneai.dto.request.AdminInvitationRequest;
import com.smartphoneai.dto.request.AccountInvitationRequest;
import com.smartphoneai.dto.response.UserResponse;
import com.smartphoneai.entity.AdminInvitation;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.EmailAlreadyExistsException;
import com.smartphoneai.exception.InvalidInvitationException;
import com.smartphoneai.exception.InvalidPasswordException;
import com.smartphoneai.exception.ProtectedAccountException;
import com.smartphoneai.repository.AdminInvitationRepository;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdminManagementServiceImpl implements AdminManagementService {
    private final UserAccountRepository users;
    private final AdminInvitationRepository invitations;
    private final AdminInvitationSender sender;
    private final PasswordEncoder passwords;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    public AdminManagementServiceImpl(UserAccountRepository users, AdminInvitationRepository invitations,
            AdminInvitationSender sender, PasswordEncoder passwords, Clock clock) {
        this.users = users; this.invitations = invitations; this.sender = sender; this.passwords = passwords; this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminView> list() {
        return users.findAllByRoleAndDeletedFalse(UserAccount.Role.ADMIN).stream()
                .map(this::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminView> listAccounts() {
        return users.findAllByDeletedFalse().stream().map(this::view).toList();
    }

    private AdminView view(UserAccount user) {
        var invitation = user.isActive() ? null : invitations.findByUserId(user.getId()).orElse(null);
        return new AdminView(UserResponse.from(user), user.isRoot(), user.isActive(), user.isDisabled(),
                invitation == null ? null : invitation.getId().toString(),
                invitation == null ? null : invitation.getExpiresAt());
    }
    @Override
    @Transactional
    public InvitationResult invite(AdminInvitationRequest input) {
        return createInvitation(input.email(), input.fullName(), UserAccount.Role.ADMIN);
    }

    @Override
    @Transactional
    public InvitationResult inviteAccount(AccountInvitationRequest input) {
        return createInvitation(input.email(), input.fullName(), UserAccount.Role.valueOf(input.role()));
    }

    private InvitationResult createInvitation(String inputEmail, String fullName, UserAccount.Role role) {
        String email = inputEmail.trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new EmailAlreadyExistsException();
        UserAccount user;
        try {
            user = users.saveAndFlush(UserAccount.invitedAccount(email, fullName, role));
        } catch (DataIntegrityViolationException exception) {
            throw new EmailAlreadyExistsException();
        }
        String token = token();
        var invitation = invitations.save(new AdminInvitation(user.getId(), hash(token), clock.instant().plusSeconds(86400)));
        sender.send(email, token);
        return new InvitationResult(invitation.getId().toString(), invitation.getExpiresAt());
    }
    @Override
    @Transactional
    public InvitationResult resend(UUID invitationId) {
        var invitation = invitations.findLockedById(invitationId).orElseThrow(InvalidInvitationException::new);
        var user = users.findLockedById(invitation.getUserId()).orElseThrow(InvalidInvitationException::new);
        if (user.isActive() || user.isDeleted() || user.isDisabled()) throw new InvalidInvitationException();
        String token = token();
        invitation.replace(hash(token), clock.instant().plusSeconds(86400));
        sender.send(user.getEmail(), token);
        return new InvitationResult(invitation.getId().toString(), invitation.getExpiresAt());
    }
    @Override
    @Transactional
    public void accept(String token, String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        var invitation = invitations.findLockedByTokenHash(hash(token)).orElseThrow(InvalidInvitationException::new);
        var user = users.findLockedById(invitation.getUserId()).orElseThrow(InvalidInvitationException::new);
        if (user.isActive() || user.isDeleted() || user.isDisabled() || !invitation.consume(clock.instant()))
            throw new InvalidInvitationException();
        user.changePasswordHash(passwords.encode(password));
        user.activate();
    }
    @Override
    @Transactional
    public void deleteAdmin(UUID actorId, UUID targetId) {
        var target = manageableTarget(actorId, targetId);
        if (target.getRole() != UserAccount.Role.ADMIN) throw new ProtectedAccountException();
        target.disableAndDelete();
    }
    @Override
    @Transactional
    public UserResponse demoteAdmin(UUID actorId, UUID targetId) {
        return changeRole(actorId, targetId, "CUSTOMER");
    }
    @Override
    @Transactional
    public UserResponse changeRole(UUID actorId, UUID targetId, String roleName) {
        var target = manageableTarget(actorId, targetId);
        if ((!"CUSTOMER".equals(roleName) && !"ADMIN".equals(roleName)) || !target.isActive())
            throw new ProtectedAccountException();
        target.changeRole(UserAccount.Role.valueOf(roleName));
        return UserResponse.from(target);
    }
    @Override
    @Transactional
    public AdminView changeStatus(UUID actorId, UUID targetId, boolean enabled) {
        var target = manageableTarget(actorId, targetId);
        target.changeEnabled(enabled);
        return view(target);
    }
    private UserAccount manageableTarget(UUID actorId, UUID targetId) {
        var target = users.findLockedById(targetId).orElseThrow(ProtectedAccountException::new);
        if (actorId.equals(targetId) || target.isRoot() || target.isDeleted())
            throw new ProtectedAccountException();
        return target;
    }
    private String token() {
        byte[] bytes = new byte[32]; random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
    private static String hash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
    }
}
