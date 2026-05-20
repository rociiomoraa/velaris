package com.velaris.dto.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
    private Boolean enabled;    // ← NUEVO
}