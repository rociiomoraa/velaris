package com.velaris.controller;

import com.velaris.dto.trip.TripFilterRequest;
import com.velaris.dto.trip.TripResponse;
import com.velaris.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@Tag(name = "Viajes")
public class TripController {

    private final TripService tripService;

    @GetMapping
    @Operation(summary = "Listar viajes con filtros")
    public ResponseEntity<Page<TripResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String sort
    ) {
        TripFilterRequest filter = new TripFilterRequest(
                type, destination, category, minPrice, maxPrice, from, to, page, size, sort);
        return ResponseEntity.ok(tripService.findAll(filter));
    }

    @GetMapping("/random")
    @Operation(summary = "Viaje aleatorio")
    public ResponseEntity<TripResponse> getRandom() {
        return ResponseEntity.ok(tripService.findRandom());
    }

    @GetMapping("/all")
    @Operation(summary = "Todos los viajes sin paginar — solo admin")
    public ResponseEntity<List<TripResponse>> getAllActive() {
        return ResponseEntity.ok(tripService.findAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener viaje por ID")
    public ResponseEntity<TripResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.findById(id));
    }

    @GetMapping("/{id}/similar")
    @Operation(summary = "Viajes similares")
    public ResponseEntity<List<TripResponse>> getSimilar(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.findSimilar(id));
    }
}