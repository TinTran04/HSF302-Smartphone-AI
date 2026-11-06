package com.smartphoneai.support;

import com.smartphoneai.entity.UserAccount;
import com.smartphoneai.service.AuthTokenService;
import jakarta.servlet.http.Cookie;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.test.autoconfigure.web.servlet.MockMvcBuilderCustomizer;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/** A browser cookie jar for integration tests, using the production JWT issuer and filter. */
public class JwtTestClient implements RequestPostProcessor {
    private static final String ATTRIBUTE = JwtTestClient.class.getName();
    private final Map<String, Cookie> cookies = new LinkedHashMap<>();

    public static JwtTestClient authenticated(AuthTokenService tokens, UserAccount user) {
        var client = new JwtTestClient();
        var response = new MockHttpServletResponse();
        tokens.issue(user).writeTo(response);
        client.capture(response);
        return client;
    }
    public static JwtTestClient invalid() {
        var client = new JwtTestClient();
        client.cookies.put("SPAI_ACCESS", new Cookie("SPAI_ACCESS", "invalid"));
        return client;
    }
    @Override public MockHttpServletRequest postProcessRequest(MockHttpServletRequest request) {
        request.setAttribute(ATTRIBUTE, this);
        request.setCookies(cookies.values().toArray(Cookie[]::new));
        return request;
    }
    private void capture(MockHttpServletResponse response) {
        for (var cookie : response.getCookies()) {
            if (cookie.getMaxAge() == 0) cookies.remove(cookie.getName());
            else cookies.put(cookie.getName(), cookie);
        }
    }
    private static void captureResult(MvcResult result) {
        if (result.getRequest().getAttribute(ATTRIBUTE) instanceof JwtTestClient client) client.capture(result.getResponse());
    }
    @TestConfiguration(proxyBeanMethods = false)
    public static class Configuration {
        @Bean MockMvcBuilderCustomizer jwtCookieJar() {
            return builder -> builder.alwaysDo(JwtTestClient::captureResult);
        }
    }
}
