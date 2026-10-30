package com.smartphoneai.controller;
import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.service.AiProviderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/admin/ai-settings")
public class AiProviderController {
    private final AiProviderService providers;
    public AiProviderController(AiProviderService providers) { this.providers=providers; }
    @GetMapping public List<AiSettingsResponse> list() { return providers.list(); }
    @PutMapping public AiSettingsResponse save(@Valid @RequestBody AiSettingsRequest input) { return providers.save(input); }
    @PostMapping("/test") public Map<String,String> test(@Valid @RequestBody AiSettingsRequest input) {
        providers.test(input); return Map.of("message", "Kết nối thành công");
    }
    @PostMapping("/activate") public List<AiSettingsResponse> activate(@Valid @RequestBody ActivateProviderRequest input) { return providers.activate(input.provider()); }
}
