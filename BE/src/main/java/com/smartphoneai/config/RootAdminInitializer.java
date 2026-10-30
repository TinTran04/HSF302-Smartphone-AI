package com.smartphoneai.config;

import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;

@Component
public class RootAdminInitializer implements ApplicationRunner {
    private final UserAccountRepository users;
    private final PasswordEncoder passwords;
    private final String username;
    private final String password;
    public RootAdminInitializer(UserAccountRepository users, PasswordEncoder passwords,
            @Value("${app.root-admin.username:}") String username,
            @Value("${app.root-admin.password:}") String password) {
        this.users = users; this.passwords = passwords; this.username = username; this.password = password;
    }
    @Override @Transactional
    public void run(ApplicationArguments args) {
        if (users.existsByRootKey("ROOT")) return;
        if (username.isBlank() && password.isBlank()) return;
        if (username.isBlank() || username.contains("@") || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalStateException("Root admin credentials are invalid");
        users.save(UserAccount.rootAdmin(username, passwords.encode(password)));
    }
}
