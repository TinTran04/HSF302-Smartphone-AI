package com.smartphoneai.service;

import com.smartphoneai.dto.request.LoginRequest;
import com.smartphoneai.entity.OtpChallenge;
import com.smartphoneai.entity.UserAccount;
import java.util.List;

public interface LoginService {
    record LoginResult(UserAccount user, OtpChallenge challenge, List<String> mergedConversationIds) {
        public LoginResult(UserAccount user, OtpChallenge challenge) {
            this(user, challenge, List.of());
        }
    }

    LoginResult beginLogin(LoginRequest request);

    LoginResult beginLogin(LoginRequest request, String guestToken);
}
