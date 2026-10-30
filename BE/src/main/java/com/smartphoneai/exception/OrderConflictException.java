package com.smartphoneai.exception;
public class OrderConflictException extends RuntimeException {
    private final String code;
    public OrderConflictException(String code) { this.code = code; }
    public String getCode() { return code; }
}
