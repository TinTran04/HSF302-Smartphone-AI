package com.smartphoneai.exception;

public class InvalidProductImageException extends RuntimeException {
    private final boolean tooLarge;
    public InvalidProductImageException() { this(false); }
    public InvalidProductImageException(boolean tooLarge) { this.tooLarge = tooLarge; }
    public boolean isTooLarge() { return tooLarge; }
}
