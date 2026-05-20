package com.velaris.controller;

import com.velaris.dto.user.ChangePasswordRequest;
import com.velaris.dto.user.UserResponse;
import com.velaris.dto.user.UserUpdateRequest;
import com.velaris.service.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(userService.getProfile(ud.getUsername()));
    }

    @PutMapping("/me")
    @Operation(summary = "Actualizar perfil")
    public ResponseEntity<UserResponse> updateMe(@AuthenticationPrincipal UserDetails ud,
                                                 @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(userService.updateProfile(ud.getUsername(), req));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Cambiar contraseña")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails ud,
                                               @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(ud.getUsername(), req);
        return ResponseEntity.noContent().build();
    }
}