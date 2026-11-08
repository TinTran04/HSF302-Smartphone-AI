package com.smartphoneai.service.impl;

import com.smartphoneai.service.LoginService;
import com.smartphoneai.service.OtpChallengeService;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.AiChatService;

import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.InvalidCredentialsException;
import com.smartphoneai.exception.AccountDisabledException;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;

@Service
public class LoginServiceImpl implements LoginService {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final OtpChallengeService otp;
    private final CartService carts;
    private final AiChatService chats;
    public LoginServiceImpl(UserAccountRepository users, PasswordEncoder passwords, OtpChallengeService otp,
                            CartService carts, AiChatService chats) {
        this.users = users; this.passwords = passwords; this.otp = otp; this.carts = carts; this.chats = chats;
    }
    @Override
    @Transactional
    public LoginResult beginLogin(LoginRequest request) {
        return beginLogin(request, null);
    }

    @Override
    @Transactional
    public LoginResult beginLogin(LoginRequest request, String guestToken) {
        String identifier = request.identifier().trim().toLowerCase(Locale.ROOT);
        var user = users.findLockedByEmail(identifier).orElse(null);
        if (user == null || user.isDeleted() || !passwords.matches(request.password(), user.getPasswordHash())) throw new InvalidCredentialsException();
        if (user.isDisabled()) throw new AccountDisabledException();
        if (!user.isActive()) {
            if (user.getRole() != UserAccount.Role.CUSTOMER || user.isPendingInvitation()) throw new InvalidCredentialsException();
            return new LoginResult(null, otp.issue(user.getEmail(), "REGISTER"));
        }
        if (user.getRole() == UserAccount.Role.ADMIN) return new LoginResult(user, null);
        carts.merge(user.getId(), request.guestCart(), request.guestCartMergeId());
        return new LoginResult(user, null, chats.claim(user.getId(), guestToken));
    }
}
