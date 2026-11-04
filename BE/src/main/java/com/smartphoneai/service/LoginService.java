package com.smartphoneai.service;

import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.UserAccount;

public interface LoginService {
    public record LoginResult(UserAccount user, OtpChallenge challenge) {}

    LoginResult beginLogin(LoginRequest request);
}
