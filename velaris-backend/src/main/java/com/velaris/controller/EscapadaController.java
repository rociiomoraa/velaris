package com.velaris.controller;

import com.velaris.dto.trip.TripResponse;
import com.velaris.service.TripService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/escapadas")
@RequiredArgsConstructor
@Tag(name = "Escapadas")
public class EscapadaController {

    private final TripService tripService;

    @GetMapping
    @Operation(summary = "Listar escapadas disponibles")
    public ResponseEntity<Page<TripResponse>> getEscapadas(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String mealPlan,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(tripService.findEscapadas(destination, mealPlan, minPrice, maxPrice, page, size));
    }
}