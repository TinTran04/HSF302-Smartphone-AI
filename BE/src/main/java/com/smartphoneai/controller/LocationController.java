package com.smartphoneai.controller;

import com.smartphoneai.dto.response.AddressSuggestionResponse;
import com.smartphoneai.service.LocationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final LocationService locations;

    public LocationController(LocationService locations) { this.locations = locations; }

    @GetMapping("/autocomplete")
    public List<AddressSuggestionResponse> autocomplete(@RequestParam(required = false) String text) {
        return locations.autocomplete(text);
    }
}
