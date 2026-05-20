package com.velaris.controller;

import com.velaris.dto.booking.BookingRequest;
import com.velaris.dto.booking.BookingResponse;
import com.velaris.service.BookingService;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Reservas")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Crear reserva")
    public ResponseEntity<BookingResponse> create(@AuthenticationPrincipal UserDetails ud,
                                                  @Valid @RequestBody BookingRequest req) {
        return ResponseEntity.ok(bookingService.create(ud.getUsername(), req));
    }

    @GetMapping("/my")
    @Operation(summary = "Mis reservas")
    public ResponseEntity<Page<BookingResponse>> myBookings(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(bookingService.myBookings(ud.getUsername(), page, size));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar reserva")
    public ResponseEntity<BookingResponse> cancel(@AuthenticationPrincipal UserDetails ud,
                                                  @PathVariable Long id) {
        return ResponseEntity.ok(bookingService.cancel(id, ud.getUsername()));
    }
}