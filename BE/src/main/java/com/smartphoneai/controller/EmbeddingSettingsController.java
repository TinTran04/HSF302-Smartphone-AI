package com.smartphoneai.controller;
import com.smartphoneai.dto.request.EmbeddingSettingsRequest;
import com.smartphoneai.service.EmbeddingSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/admin/embedding-settings")
public class EmbeddingSettingsController {
    private final EmbeddingSettingsService settings;
    public EmbeddingSettingsController(EmbeddingSettingsService settings) { this.settings=settings; }
    @GetMapping public Map<String,Object> get() { return settings.describe(); }
    @PutMapping public Map<String,Object> put(@Valid @RequestBody EmbeddingSettingsRequest input) { return settings.configure(input); }
}
