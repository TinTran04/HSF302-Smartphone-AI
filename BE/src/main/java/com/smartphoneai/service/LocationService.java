package com.smartphoneai.service;

import com.smartphoneai.dto.response.AddressSuggestionResponse;
import com.smartphoneai.dto.response.ReverseLocationResponse;
import java.util.List;
import java.util.Optional;

public interface LocationService {
    List<AddressSuggestionResponse> autocomplete(String text);
    Optional<ReverseLocationResponse> reverse(String latitude, String longitude);
}
