package com.smartphoneai.exception;
import java.util.Locale;
public class AiProviderException extends RuntimeException {
    private final int providerStatus;
    private boolean balanceFailure;
    private Long retryAfterSeconds;
    private String quotaScope = "UNKNOWN";

    public AiProviderException() {
        this(0);
    }

    public AiProviderException(int providerStatus) {
        super(switch (providerStatus) {
            case 401, 403 -> "Nhà cung cấp AI từ chối truy cập. Hãy kiểm tra API key và quyền sử dụng model.";
            case 404 -> "Model AI không khả dụng với API key này. Hãy kiểm tra lại tên model.";
            case 429 -> "Đã chạm giới hạn sử dụng AI. Hãy kiểm tra quota của tài khoản hoặc thử lại sau.";
            case 502, 503, 504 -> "Nhà cung cấp AI đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau.";
            default -> "Không thể kết nối nhà cung cấp AI. Vui lòng kiểm tra cấu hình và thử lại.";
        });
        this.providerStatus = providerStatus;
    }

    public String getCode() {
        return switch (providerStatus) {
            case 401, 403 -> "AI_PROVIDER_AUTH_ERROR";
            case 404 -> "AI_PROVIDER_MODEL_ERROR";
            case 429 -> "AI_PROVIDER_RATE_LIMIT";
            case 502, 503, 504 -> "AI_PROVIDER_BUSY";
            default -> "AI_PROVIDER_ERROR";
        };
    }

    public static AiProviderException fromProvider(int status, String message) {
        String detail = message == null ? "" : message.toLowerCase(Locale.ROOT);
        if (status == 400 && (detail.contains("api_key_invalid") || detail.contains("api_key_expired")
                || detail.contains("api key expired") || detail.contains("api key not valid"))) {
            return new AiProviderException(401);
        }
        // DeepSeek trả 402 khi tài khoản hết số dư: xử lý như hết quota để chuyển sang key dự phòng.
        var result = new AiProviderException(status == 402 ? 429 : status);
        result.balanceFailure = status == 402;
        if (status == 429) {
            if (detail.contains("perday") || detail.contains("per_day") || detail.contains("per day")
                    || detail.contains("daily") || detail.contains("tokens per day")) result.quotaScope = "DAY";
            else if (detail.contains("perminute") || detail.contains("per_minute") || detail.contains("per minute"))
                result.quotaScope = "MINUTE";
        }
        var delay = java.util.regex.Pattern.compile("\"retrydelay\"\\s*:\\s*\"([0-9]+(?:\\.[0-9]+)?)s\"").matcher(detail);
        if (delay.find()) {
            try { result.retryAfterSeconds = Math.max(1, Math.min(604800, (long) Math.ceil(Double.parseDouble(delay.group(1))))); }
            catch (NumberFormatException ignored) { /* A malformed provider delay is treated as unknown. */ }
        }
        return result;
    }

    public boolean isKeyFailure() {
        return providerStatus == 401 || providerStatus == 403 || providerStatus == 404 || providerStatus == 429;
    }

    public boolean isQuotaExceeded() {
        return providerStatus == 429;
    }

    public String getQuotaReason() {
        if (!isQuotaExceeded()) return getCode();
        return switch (quotaScope) {
            case "DAY" -> "AI_PROVIDER_DAILY_LIMIT";
            case "MINUTE" -> "AI_PROVIDER_MINUTE_LIMIT";
            default -> getCode();
        };
    }

    public boolean isServiceUnavailable() {
        return providerStatus == 503;
    }

    public boolean isBalanceFailure() { return balanceFailure; }
    public boolean isAuthenticationFailure() { return providerStatus == 401; }
    public boolean isModelFailure() { return providerStatus == 403 || providerStatus == 404; }
    public Long getRetryAfterSeconds() { return retryAfterSeconds; }
    public AiProviderException withRetryAfter(String header) {
        if (header == null) return this;
        try { retryAfterSeconds = Math.max(1, Math.min(604800, Long.parseLong(header.trim()))); }
        catch (NumberFormatException ignored) {
            try {
                var target = java.time.ZonedDateTime.parse(header, java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME).toInstant();
                retryAfterSeconds = Math.max(1, Math.min(604800, java.time.Duration.between(java.time.Instant.now(), target).getSeconds()));
            } catch (java.time.format.DateTimeParseException invalid) { /* Keep a valid delay from the response body. */ }
        }
        return this;
    }
}
