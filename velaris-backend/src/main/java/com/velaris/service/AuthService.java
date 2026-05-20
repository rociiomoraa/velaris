package com.velaris.service;

import com.velaris.dto.auth.AuthResponse;
import com.velaris.dto.auth.LoginRequest;
import com.velaris.dto.auth.RegisterRequest;
import com.velaris.exception.ApiException;
import com.velaris.model.Role;
import com.velaris.model.User;
import com.velaris.repository.UserRepository;
import com.velaris.security.JwtTokenProvider;
import com.velaris.security.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtTokenProvider      jwtTokenProvider;
    private final AuthenticationManager authManager;
    private final LoginAttemptService   loginAttemptService;
    private final EmailService          emailService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException("El email ya está registrado", HttpStatus.CONFLICT);
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.USER)
                .enabled(true)
                .build();
        userRepository.save(user);
        emailService.sendWelcome(user.getEmail(), user.getName());
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest req, String ip) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
            loginAttemptService.loginSucceeded(ip);
            User user = userRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new ApiException("Usuario no encontrado", HttpStatus.NOT_FOUND));

            if (!Boolean.TRUE.equals(user.getEnabled())) {  // ← AÑADIDO
                throw new ApiException("Tu cuenta ha sido desactivada. Contacta con el administrador.", HttpStatus.FORBIDDEN);
            }

            String token = jwtTokenProvider.generateToken(user.getEmail());
            return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
        } catch (BadCredentialsException e) {
            loginAttemptService.loginFailed(ip);
            throw new ApiException("Credenciales incorrectas", HttpStatus.UNAUTHORIZED);
        }
    }
}