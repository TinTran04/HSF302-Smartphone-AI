package com.smartphoneai.service.impl;

import com.smartphoneai.service.AiChatService;
import com.smartphoneai.service.CartService;
import com.smartphoneai.service.OtpChallengeService;
import com.smartphoneai.service.RegistrationService;

import com.smartphoneai.dto.request.RegisterRequest;
import com.smartphoneai.dto.request.CartItemRequest;
import java.util.List;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.exception.EmailAlreadyExistsException;
import com.smartphoneai.exception.InvalidPasswordException;
import java.nio.charset.StandardCharsets;
import com.smartphoneai.repository.OtpChallengeRepository;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class RegistrationServiceImpl implements RegistrationService {
    private final UserAccountRepository users;
    private final OtpChallengeRepository challenges;
    private final OtpChallengeService otp;
    private final PasswordEncoder passwords;
    private final CartService carts;
    private final AiChatService chats;

    public RegistrationServiceImpl(UserAccountRepository users, OtpChallengeRepository challenges,
                               OtpChallengeService otp, PasswordEncoder passwords, CartService carts, AiChatService chats) {
        this.users = users; this.challenges = challenges; this.otp = otp; this.passwords = passwords; this.carts = carts; this.chats = chats;
    }

    @Override
    @Transactional
    public OtpChallenge register(RegisterRequest input) {
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new EmailAlreadyExistsException();
        users.save(UserAccount.pendingCustomer(email, input.fullName(), input.phone(), passwords.encode(input.password())));
        return otp.issue(email, "REGISTER");
    }

    @Override
    @Transactional
    public Optional<Verified> verify(UUID challengeId, String code, List<CartItemRequest> guestCart, String guestToken) {
        return verify(challengeId, code, guestCart, guestToken, null);
    }

    @Override
    @Transactional
    public Optional<Verified> verify(UUID challengeId, String code, List<CartItemRequest> guestCart, String guestToken, UUID mergeId) {
        var challenge = challenges.findById(challengeId).orElse(null);
        if (challenge == null || !"REGISTER".equals(challenge.getPurpose())) return Optional.empty();
        var account = users.findLockedByEmail(challenge.getEmail()).orElse(null);
        if (account == null || account.isDeleted() || account.isDisabled() || account.isActive() || account.isPendingInvitation()
                || account.getRole() != UserAccount.Role.CUSTOMER) return Optional.empty();
        var result = otp.verify(challengeId, "REGISTER", code);
        if (result != OtpChallenge.Result.SUCCESS) return Optional.empty();
        account.activate();
        carts.merge(account.getId(), guestCart, mergeId);
        return Optional.of(new Verified(account, chats.claim(account.getId(), guestToken)));
    }
}
