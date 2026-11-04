package com.smartphoneai.exception;

public class EmailDeliveryException extends RuntimeException {
    public EmailDeliveryException(String message) {
        super(message);
    }

    public EmailDeliveryException(Throwable cause) {
        super("Không thể gửi email. Vui lòng thử lại sau hoặc liên hệ quản trị viên.", cause);
    }
}
