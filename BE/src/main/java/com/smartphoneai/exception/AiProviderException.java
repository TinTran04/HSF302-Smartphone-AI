package com.smartphoneai.exception;
public class AiProviderException extends RuntimeException {
    private final int providerStatus;

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

    public boolean isQuotaExceeded() {
        return providerStatus == 429;
    }

    public boolean isServiceUnavailable() {
        return providerStatus == 503;
    }
}
