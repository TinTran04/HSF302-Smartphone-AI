package com.smartphoneai.entity;

import jakarta.persistence.*;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserAccount {
    public enum Role { CUSTOMER, ADMIN }
    @Id private UUID id;
    @Column(unique = true) private String email;
    @Column(unique = true) private String username;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Column(name = "full_name", nullable = false) private String fullName;
    @Column(nullable = false) private String phone;
    @Column(nullable = false) private String address;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private boolean active;
    @Column(nullable = false) private boolean deleted;
    @Column(name = "root_key", unique = true) private String rootKey;
    @Version private long version;

    protected UserAccount() {}

    public static UserAccount pendingCustomer(String email, String name, String phone, String passwordHash) {
        var user = new UserAccount();
        user.id = UUID.randomUUID();
        user.email = email.trim().toLowerCase(Locale.ROOT);
        user.fullName = name.trim();
        user.phone = phone.trim();
        user.address = "";
        user.passwordHash = passwordHash;
        user.role = Role.CUSTOMER;
        user.active = false;
        return user;
    }

    public static UserAccount rootAdmin(String username, String passwordHash) {
        var user = new UserAccount();
        user.id = UUID.randomUUID();
        user.username = username.trim().toLowerCase(Locale.ROOT);
        user.fullName = "Admin gốc";
        user.phone = "";
        user.address = "";
        user.passwordHash = passwordHash;
        user.role = Role.ADMIN;
        user.active = true;
        user.rootKey = "ROOT";
        return user;
    }

    public static UserAccount invitedAdmin(String email, String name) {
        var user = pendingCustomer(email, name, "", "!");
        user.role = Role.ADMIN;
        return user;
    }

    public void activate() { active = true; }
    public void changePasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void updateProfile(String name, String phone, String address) {
        this.fullName = name.trim(); this.phone = phone.trim(); this.address = address.trim();
    }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public boolean isRoot() { return rootKey != null; }
    public boolean isDeleted() { return deleted; }
    public void disableAndDelete() { deleted = true; active = false; }
    public void demoteToCustomer() { role = Role.CUSTOMER; }
}
