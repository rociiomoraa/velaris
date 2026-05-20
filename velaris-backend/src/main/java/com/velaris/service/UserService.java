package com.velaris.service;

import com.velaris.dto.user.ChangePasswordRequest;
import com.velaris.dto.user.UserResponse;
import com.velaris.dto.user.UserUpdateRequest;
import com.velaris.exception.ApiException;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.User;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(String email) {
        User user = findByEmail(email);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UserUpdateRequest req) {
        User user = findByEmail(email);
        if (req.getName()      != null) user.setName(req.getName());
        if (req.getPhone()     != null) user.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new ApiException("La contraseña actual no es correcta", HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {                          // ← NUEVO
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse toggleEnabled(Long id) {                      // ← NUEVO
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
        return toResponse(userRepository.save(user));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(),
                u.getPhone(), u.getAvatarUrl(), u.getRole().name(), u.getCreatedAt(),
                u.getEnabled());
    }
}