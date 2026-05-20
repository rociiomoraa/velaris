package com.velaris.controller;

import com.velaris.dto.ai.AiChatRequest;
import com.velaris.dto.ai.AiChatResponse;
import com.velaris.dto.ai.RecommendationResponse;
import com.velaris.service.AiAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "Asistente IA (Vera)")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiAssistantService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Chat básico con Vera")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest req) {
        return ResponseEntity.ok(aiService.chat(req));
    }

    @PostMapping("/chat/persistent")
    @Operation(summary = "Chat con historial persistente")
    public ResponseEntity<AiChatResponse> chatPersistent(@AuthenticationPrincipal UserDetails ud,
                                                         @Valid @RequestBody AiChatRequest req) {
        return ResponseEntity.ok(aiService.chatWithHistory(req, ud.getUsername()));
    }

    @GetMapping("/recommendations")
    @Operation(summary = "Recomendaciones personalizadas")
    public ResponseEntity<RecommendationResponse> recommendations(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(aiService.getRecommendations(ud.getUsername()));
    }

    @DeleteMapping("/history")
    @Operation(summary = "Borrar historial de conversación")
    public ResponseEntity<Void> clearHistory(@AuthenticationPrincipal UserDetails ud) {
        aiService.clearHistory(ud.getUsername());
        return ResponseEntity.noContent().build();
    }
}