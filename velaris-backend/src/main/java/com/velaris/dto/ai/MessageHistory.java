package com.velaris.dto.ai;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageHistory {
    private String role;
    private String content;
}