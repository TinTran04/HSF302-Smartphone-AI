package com.smartphoneai.dto.response;

import com.smartphoneai.dto.GeoLocation;

public record AddressSuggestionResponse(String id, String label, GeoLocation location) {}
