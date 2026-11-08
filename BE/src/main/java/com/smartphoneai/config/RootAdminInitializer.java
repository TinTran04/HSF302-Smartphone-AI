package com.smartphoneai.config;

import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class RootAdminInitializer implements ApplicationRunner {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final Validator validator;
    private final String email;
    private final String password;
    public RootAdminInitializer(UserAccountRepository users, PasswordEncoder passwords, Validator validator,
            @Value("${app.root-admin.email:}") String email,
            @Value("${app.root-admin.password:}") String password) {
        this.users = users; this.passwords = passwords; this.validator = validator; this.email = email; this.password = password;
    }
    private record RootEmail(@NotBlank @Email @Size(max = 254) String value) {}
    @Override @Transactional
    public void run(ApplicationArguments args) {
        var root = users.findByRootKey("ROOT").orElse(null);
        if (root != null && root.getEmail() != null && !root.getEmail().isBlank()) return;
        if (root == null && email.isBlank() && password.isBlank()) return;

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (!validator.validate(new RootEmail(normalizedEmail)).isEmpty())
            throw new IllegalStateException("Configure ROOT_ADMIN_EMAIL with a valid email address");
        var owner = users.findByEmail(normalizedEmail).orElse(null);
        if (owner != null && (root == null || !owner.getId().equals(root.getId())))
            throw new IllegalStateException("The configured root Admin email is already used by another account");
        if (root != null) {
            root.assignRootEmail(normalizedEmail);
            return;
        }
        if (password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalStateException("Root admin credentials are invalid");
        users.save(UserAccount.rootAdmin(normalizedEmail, passwords.encode(password)));
    }
}
