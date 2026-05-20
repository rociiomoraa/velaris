package com.velaris.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiChatRequest {
    @NotBlank
    private String message;
    private List<MessageHistory> history;
}