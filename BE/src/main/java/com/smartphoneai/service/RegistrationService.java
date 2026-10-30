package com.smartphoneai.service;

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
public class RegistrationService {
    private final UserAccountRepository users;
    private final OtpChallengeRepository challenges;
    private final OtpChallengeService otp;
    private final PasswordEncoder passwords;
    private final CartService carts;
    private final AiChatService chats;
    public record Verified(UserAccount user, List<String> mergedConversationIds) {}

    public RegistrationService(UserAccountRepository users, OtpChallengeRepository challenges,
                               OtpChallengeService otp, PasswordEncoder passwords, CartService carts, AiChatService chats) {
        this.users = users; this.challenges = challenges; this.otp = otp; this.passwords = passwords; this.carts = carts; this.chats = chats;
    }

    @Transactional
    public OtpChallenge register(RegisterRequest input) {
        if (input.password().getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPasswordException();
        String email = input.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) throw new EmailAlreadyExistsException();
        users.save(UserAccount.pendingCustomer(email, input.fullName(), input.phone(), passwords.encode(input.password())));
        return otp.issue(email, "REGISTER");
    }

    @Transactional
    public Optional<Verified> verify(UUID challengeId, String code, List<CartItemRequest> guestCart, String guestToken) {
        var challenge = challenges.findLockedById(challengeId).orElse(null);
        if (challenge == null || !("REGISTER".equals(challenge.getPurpose()) || "LOGIN".equals(challenge.getPurpose()))) return Optional.empty();
        var account = users.findByEmail(challenge.getEmail()).orElse(null);
        if (account == null || ("REGISTER".equals(challenge.getPurpose()) && account.isActive())
                || ("LOGIN".equals(challenge.getPurpose()) && !account.isActive())) return Optional.empty();
        var result = otp.verify(challengeId, challenge.getPurpose(), code);
        if (result != OtpChallenge.Result.SUCCESS) return Optional.empty();
        if ("REGISTER".equals(challenge.getPurpose())) account.activate();
        carts.merge(account.getId(), guestCart);
        return Optional.of(new Verified(account, chats.claim(account.getId(), guestToken)));
    }
}
