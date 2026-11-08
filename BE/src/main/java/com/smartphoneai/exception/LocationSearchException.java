package com.smartphoneai.exception;

public class LocationSearchException extends RuntimeException {
    private final boolean rateLimited;

    public LocationSearchException(boolean rateLimited) {
        super(rateLimited ? "Location search rate limit" : "Location search unavailable");
        this.rateLimited = rateLimited;
    }

    public boolean isRateLimited() { return rateLimited; }
}
