package com.velaris.dto.user;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    @Size(min = 2, max = 100)
    private String name;
    @Size(max = 20)
    private String phone;
    @Size(max = 500)
    private String avatarUrl;
}