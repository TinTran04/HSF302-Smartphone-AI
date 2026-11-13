package com.smartphoneai.controller;

import com.smartphoneai.service.impl.AiKeyManagementService;
import com.smartphoneai.service.impl.AiKeyEditorService;
import com.smartphoneai.service.impl.AiActivityLogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/ai-settings/key-management")
public class AiKeyManagementController {
    public record RenameRequest(@NotBlank @Size(max = 80) String keyRef, @NotBlank @Size(max = 80) String name) {}
    private final AiKeyManagementService keys;
    private AiKeyEditorService editor;
    private AiActivityLogService activity;
    @org.springframework.beans.factory.annotation.Autowired(required=false)
    public void setEditor(AiKeyEditorService editor) { this.editor=editor; }
    @org.springframework.beans.factory.annotation.Autowired(required=false)
    public void setActivity(AiActivityLogService activity) { this.activity=activity; }

    public AiKeyManagementController(AiKeyManagementService keys) { this.keys = keys; }

    @GetMapping
    public AiKeyManagementService.State get(@RequestParam String provider, @RequestParam(required = false) Long before) {
        return keys.get(provider, before);
    }

    @PutMapping("/{configId}/name")
    public void rename(@PathVariable Long configId, @Valid @RequestBody RenameRequest input) {
        keys.rename(configId, input.keyRef(), input.name());
    }

    @PostMapping("/{configId}/promote/{keyId}")
    public void promote(@PathVariable Long configId, @PathVariable Long keyId) { keys.promote(configId, keyId); }

    @PostMapping("/key")
    public com.smartphoneai.dto.response.AiSettingsResponse edit(@Valid @RequestBody AiKeyEditorService.EditRequest input) {
        return editor.edit(input);
    }
    @PostMapping("/{configId}/check/{keyRef}")
    public void check(@PathVariable Long configId,@PathVariable String keyRef) { editor.checkKey(configId,keyRef); }
    @DeleteMapping("/{configId}/key/{keyRef}")
    public com.smartphoneai.dto.response.AiSettingsResponse remove(@PathVariable Long configId,@PathVariable String keyRef,
            @RequestParam(required=false) String replacementKeyRef) {
        return editor.remove(configId,keyRef,replacementKeyRef);
    }
    @PostMapping("/{configId}/key/{keyRef}/move")
    public com.smartphoneai.dto.response.AiSettingsResponse move(@PathVariable Long configId,@PathVariable String keyRef,@RequestParam int direction) {
        return editor.removeOrMove(configId,keyRef,direction);
    }
    @GetMapping("/activity")
    public AiActivityLogService.Page activity(@RequestParam String provider,@RequestParam(defaultValue="0") int page,
                                            @RequestParam(defaultValue="10") int size) {
        return activity.get(provider,page,size);
    }
    @GetMapping("/models")
    public java.util.List<String> savedModels(@RequestParam String provider) { return keys.savedModels(provider); }
}
