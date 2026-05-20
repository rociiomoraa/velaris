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
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@Tag(name = "Vuelos")
public class FlightController {

    private final TripService tripService;

    @GetMapping
    @Operation(summary = "Listar vuelos disponibles")
    public ResponseEntity<Page<TripResponse>> getFlights(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String cabinClass,
            @RequestParam(required = false) Boolean includesHotel,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(
                tripService.findFlights(destination, cabinClass, includesHotel, minPrice, maxPrice, page, size)
        );
    }
}