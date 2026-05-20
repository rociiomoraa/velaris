package com.velaris.controller;

import com.velaris.dto.trip.TripResponse;
import com.velaris.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@Tag(name = "Favoritos")
@SecurityRequirement(name = "bearerAuth")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Mis favoritos")
    public ResponseEntity<List<TripResponse>> getFavorites(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(favoriteService.getFavorites(ud.getUsername()));
    }

    @PostMapping("/{tripId}")
    @Operation(summary = "Añadir a favoritos")
    public ResponseEntity<Void> add(@AuthenticationPrincipal UserDetails ud,
                                    @PathVariable Long tripId) {
        favoriteService.addFavorite(ud.getUsername(), tripId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{tripId}")
    @Operation(summary = "Eliminar de favoritos")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserDetails ud,
                                       @PathVariable Long tripId) {
        favoriteService.removeFavorite(ud.getUsername(), tripId);
        return ResponseEntity.noContent().build();
    }
}