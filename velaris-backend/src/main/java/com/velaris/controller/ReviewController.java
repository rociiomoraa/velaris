package com.velaris.controller;

import com.velaris.dto.review.ReviewRequest;
import com.velaris.dto.review.ReviewResponse;
import com.velaris.dto.review.TripRatingResponse;
import com.velaris.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reseñas")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Crear reseña")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ReviewResponse> create(@AuthenticationPrincipal UserDetails ud,
                                                 @Valid @RequestBody ReviewRequest req) {
        return ResponseEntity.ok(reviewService.create(ud.getUsername(), req));
    }

    @GetMapping("/trip/{tripId}")
    @Operation(summary = "Reseñas de un viaje")
    public ResponseEntity<Page<ReviewResponse>> getByTrip(
            @PathVariable Long tripId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(reviewService.getByTrip(tripId, page, size));
    }

    @GetMapping("/trip/{tripId}/rating")
    @Operation(summary = "Valoración media de un viaje")
    public ResponseEntity<TripRatingResponse> getRating(@PathVariable Long tripId) {
        return ResponseEntity.ok(reviewService.getTripRating(tripId));
    }
}