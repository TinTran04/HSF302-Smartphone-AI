package com.smartphoneai.service;

import com.smartphoneai.exception.AiProviderException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class ConfigSecretCipher {
    private final String encodedKey;
    private final SecureRandom random = new SecureRandom();
    public ConfigSecretCipher(@Value("${app.ai.encryption-key:}") String encodedKey) { this.encodedKey=encodedKey; }
    public String encrypt(String provider, String secret) {
        try {
            byte[] iv = new byte[12]; random.nextBytes(iv);
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key(), new GCMParameterSpec(128, iv));
            cipher.updateAAD(provider.getBytes(StandardCharsets.UTF_8));
            byte[] encrypted = cipher.doFinal(secret.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv,0,combined,0,iv.length); System.arraycopy(encrypted,0,combined,iv.length,encrypted.length);
            return "v1:" + Base64.getEncoder().encodeToString(combined);
        } catch (Exception ex) { throw new AiProviderException(); }
    }
    public String decrypt(String provider, String value) {
        try {
            if (!value.startsWith("v1:")) throw new IllegalArgumentException();
            byte[] data = Base64.getDecoder().decode(value.substring(3));
            if (data.length < 29) throw new IllegalArgumentException();
            byte[] iv = java.util.Arrays.copyOfRange(data,0,12);
            var cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, iv));
            cipher.updateAAD(provider.getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(data,12,data.length-12), StandardCharsets.UTF_8);
        } catch (Exception ex) { throw new AiProviderException(); }
    }
    private SecretKeySpec key() {
        byte[] bytes = Base64.getDecoder().decode(encodedKey);
        if (bytes.length != 32) throw new IllegalArgumentException();
        return new SecretKeySpec(bytes,"AES");
    }
}
