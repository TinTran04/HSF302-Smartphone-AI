package com.smartphoneai.controller;

import com.smartphoneai.dto.request.KnowledgeStatusRequest;
import com.smartphoneai.dto.response.KnowledgeDocumentResponse;
import com.smartphoneai.service.DocumentProcessingService;
import com.smartphoneai.service.KnowledgeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/admin/knowledge/documents")
public class KnowledgeController {
    private final KnowledgeService documents;
    private final DocumentProcessingService processing;
    public KnowledgeController(KnowledgeService documents, DocumentProcessingService processing) { this.documents=documents; this.processing=processing; }
    @GetMapping public List<KnowledgeDocumentResponse> list() { return documents.list(); }
    @PostMapping public ResponseEntity<KnowledgeDocumentResponse> upload(@RequestPart("file") MultipartFile file) {
        UUID id=documents.create(file); var result=documents.get(id); processing.process(id); return ResponseEntity.accepted().body(result);
    }
    @PutMapping("/{id}/content") public ResponseEntity<KnowledgeDocumentResponse> replace(@PathVariable UUID id,@RequestPart("file") MultipartFile file) {
        documents.replace(id,file); var result=documents.get(id); processing.process(id); return ResponseEntity.accepted().body(result);
    }
    @PostMapping("/{id}/reindex") public ResponseEntity<KnowledgeDocumentResponse> reindex(@PathVariable UUID id) {
        var result=documents.markProcessing(id); processing.process(id); return ResponseEntity.accepted().body(result);
    }
    @PatchMapping("/{id}/status") public KnowledgeDocumentResponse status(@PathVariable UUID id,@Valid @RequestBody KnowledgeStatusRequest input) {
        return documents.enabled(id,input.enabled());
    }
    @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { documents.delete(id); return ResponseEntity.noContent().build(); }
}
