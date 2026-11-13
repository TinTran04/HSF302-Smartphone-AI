package com.smartphoneai.controller;
import com.smartphoneai.dto.request.*;
import com.smartphoneai.dto.response.AiSettingsResponse;
import com.smartphoneai.service.AiProviderService;
import com.smartphoneai.service.AiModelCatalogService;
import com.smartphoneai.dto.response.AiModelOptionsResponse;
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
    private final AiModelCatalogService models;
    public AiProviderController(AiProviderService providers, AiKeyAlertService alerts, AiModelCatalogService models) {
        this.providers=providers; this.alerts=alerts; this.models=models;
    }
    /** POST để API key mới (nếu có) đi trong body, không nằm trên URL. */
    @PostMapping("/models") public AiModelOptionsResponse models(@Valid @RequestBody AiModelOptionsRequest input) {
        return models.options(input);
    }
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
        providers.test(input); return Map.of("message", "Đã kiểm tra kết nối. Xem trạng thái từng key trong mục API key.");
    }
    @PostMapping("/activate") public List<AiSettingsResponse> activate(@Valid @RequestBody ActivateProviderRequest input) { return providers.activate(input.provider(), input.configId()); }
}
