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
    private Double latitude;
    private Double longitude;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private boolean active;
    @Column(nullable = false) private boolean deleted;
    @Column(nullable = false) private boolean disabled;
    @Column(name = "root_key", unique = true) private String rootKey;
    @Column(name = "credential_version", nullable = false) private long credentialVersion;
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

    public static UserAccount rootAdmin(String email, String passwordHash) {
        var user = new UserAccount();
        user.id = UUID.randomUUID();
        user.email = email.trim().toLowerCase(Locale.ROOT);
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
        return invitedAccount(email, name, Role.ADMIN);
    }

    public static UserAccount invitedAccount(String email, String name, Role role) {
        var user = pendingCustomer(email, name, "", "!");
        user.role = role;
        return user;
    }

    public void activate() { active = true; }
    public void assignRootEmail(String email) {
        if (!isRoot()) throw new IllegalStateException("Only the root Admin can use this migration");
        this.email = email.trim().toLowerCase(Locale.ROOT);
        this.username = null;
    }
    public void changePasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
        credentialVersion++;
    }
    public void changeRole(Role newRole) {
        if (!isRoot() && newRole != null && newRole != role) {
            role = newRole;
            credentialVersion++;
        }
    }
    public void demoteToCustomer() { changeRole(Role.CUSTOMER); }
    public void changeEnabled(boolean enabled) {
        boolean newDisabled = !enabled;
        if (disabled != newDisabled) {
            disabled = newDisabled;
            credentialVersion++;
        }
    }
    public void updateProfile(String name, String phone, String address) {
        if (!this.address.equals(address.trim())) {
            latitude = null;
            longitude = null;
        }
        this.fullName = name.trim(); this.phone = phone.trim(); this.address = address.trim();
    }
    public void updateProfile(String name, String phone, String address, Double latitude, Double longitude) {
        this.fullName = name.trim(); this.phone = phone.trim(); this.address = address.trim();
        this.latitude = latitude;
        this.longitude = longitude;
    }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getPasswordHash() { return passwordHash; }
    public long getCredentialVersion() { return credentialVersion; }
    public Role getRole() { return role; }
    public boolean isActive() { return active; }
    public boolean isPendingInvitation() { return !active && "!".equals(passwordHash); }
    public boolean isRoot() { return rootKey != null; }
    public String getRootKey() { return rootKey; }
    public boolean isDeleted() { return deleted; }
    public boolean isDisabled() { return disabled; }
    public void disableAndDelete() { deleted = true; active = false; }
}
