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
            @Value("${app.root-admin.username:admin}") String username,
            @Value("${app.root-admin.password:AdminPassword123!}") String password) {
        this.users = users; this.passwords = passwords; this.username = username; this.password = password;
    }
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RootAdminInitializer.class);
    @Override @Transactional
    public void run(ApplicationArguments args) {
        log.info("===> RootAdminInitializer invoked! username={}, configured password={}", username, password);
        var existing = users.findByRootKey("ROOT");
        log.info("===> Root user lookup by ROOT: present={}", existing.isPresent());
        if (existing.isPresent()) {
            var root = existing.get();
            boolean match = passwords.matches(password, root.getPasswordHash());
            log.info("===> Root user found: username={}, password match={}", root.getUsername(), match);
            if (!password.isBlank() && !match) {
                root.changePasswordHash(passwords.encode(password));
                users.saveAndFlush(root);
                log.info("===> Root admin password synchronized with configuration!");
            }
            return;
        }
        if (username.isBlank() && password.isBlank()) return;
        if (username.isBlank() || username.contains("@") || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new IllegalStateException("Root admin credentials are invalid");
        var admin = users.saveAndFlush(UserAccount.rootAdmin(username, passwords.encode(password)));
        log.info("===> Root admin created successfully with id={}", admin.getId());
    }
}
