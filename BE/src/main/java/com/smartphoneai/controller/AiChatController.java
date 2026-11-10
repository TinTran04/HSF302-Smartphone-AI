package com.smartphoneai.controller;
import com.smartphoneai.dto.request.*;
import com.smartphoneai.service.AiChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/ai")
public class AiChatController {
    private final AiChatService chats;
    private final com.smartphoneai.service.impl.AiChatMetrics metrics;
    public AiChatController(AiChatService chats, com.smartphoneai.service.impl.AiChatMetrics metrics) { this.chats=chats; this.metrics=metrics; }
    @PostMapping("/conversations") public ResponseEntity<?> create(Authentication auth, @RequestHeader(value="X-Guest-Session",required=false) String token,
            @Valid @RequestBody CreateConversationRequest request) { return ResponseEntity.status(201).body(Map.of("conversationId",chats.create(auth,token,request).toString())); }
    @GetMapping("/conversations") public List<Map<String,Object>> list(Authentication auth, @RequestHeader(value="X-Guest-Session",required=false) String token) { return chats.list(auth,token); }
    @GetMapping("/conversations/{id}") public Map<String,Object> detail(Authentication auth, @RequestHeader(value="X-Guest-Session",required=false) String token,@PathVariable UUID id) { return chats.detail(auth,token,id); }
    @DeleteMapping("/conversations/{id}") public ResponseEntity<Void> delete(Authentication auth, @PathVariable UUID id) { chats.delete(auth,id); return ResponseEntity.noContent().build(); }
    @PostMapping("/conversations/{id}/messages") public Map<String,Object> send(Authentication auth, @RequestHeader(value="X-Guest-Session",required=false) String token,
            @PathVariable UUID id,@Valid @RequestBody ChatMessageRequest request) {
        long started = System.nanoTime();
        boolean success = false;
        try {
            var answer = chats.send(auth,token,id,request.content(),request.requestId());
            success = true;
            return answer;
        } finally {
            metrics.record(java.util.concurrent.TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started), success);
        }
    }
    @PostMapping("/topic-switches/{id}/confirm") public Map<String,Object> confirm(Authentication auth,@RequestHeader(value="X-Guest-Session",required=false) String token,@PathVariable UUID id) { return chats.confirm(auth,token,id); }
    @PostMapping("/topic-switches/{id}/cancel") public ResponseEntity<Void> cancel(Authentication auth,@RequestHeader(value="X-Guest-Session",required=false) String token,@PathVariable UUID id) { chats.cancel(auth,token,id); return ResponseEntity.noContent().build(); }
}
