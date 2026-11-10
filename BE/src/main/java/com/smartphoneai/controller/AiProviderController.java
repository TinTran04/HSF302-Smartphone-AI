package com.smartphoneai.controller;
import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.AiKeyAlertService;
import com.smartphoneai.dto.response.AiKeyAlertResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/admin/ai-settings")
public class AiProviderController {
    private final AiProviderService providers;
    private final AiKeyAlertService alerts;
    public AiProviderController(AiProviderService providers, AiKeyAlertService alerts) { this.providers=providers; this.alerts=alerts; }
    public record KeyAlertStatus(AiKeyAlertResponse alert) {}
    @GetMapping("/key-alert") public KeyAlertStatus keyAlert() { return new KeyAlertStatus(alerts.current().orElse(null)); }
    @GetMapping public List<AiSettingsResponse> list() { return providers.list(); }
    @PostMapping("/{configId}/backup-keys/{keyId}/test")
    public Map<String,String> testBackup(@PathVariable Long configId, @PathVariable Long keyId) {
        providers.testBackupKey(configId, keyId);
        return Map.of("message", "Đã kiểm tra kết nối key dự phòng.");
    }
    @PutMapping public AiSettingsResponse save(@Valid @RequestBody AiSettingsRequest input) { return providers.save(input); }
    @PostMapping("/test") public Map<String,String> test(@Valid @RequestBody AiSettingsRequest input) {
        providers.test(input); return Map.of("message", "Kết nối thành công");
    }
    @PostMapping("/activate") public List<AiSettingsResponse> activate(@Valid @RequestBody ActivateProviderRequest input) { return providers.activate(input.provider(), input.configId()); }
}
