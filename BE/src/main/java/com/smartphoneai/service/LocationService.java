package com.smartphoneai.service;

import com.smartphoneai.dto.response.AddressSuggestionResponse;
import java.util.List;

public interface LocationService {
    List<AddressSuggestionResponse> autocomplete(String text);
}
