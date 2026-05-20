package com.velaris.dto.trip;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {

    @NotBlank @Size(max = 200)
    private String title;

    private String description;

    @NotBlank @Size(max = 150)
    private String destination;

    @Size(max = 150)
    private String origin;

    @NotNull @DecimalMin("0.0")
    private BigDecimal price;

    @NotNull
    private LocalDate departureDate;

    @NotNull
    private LocalDate returnDate;

    @NotNull @Min(1)
    private Integer durationDays;

    @NotNull @Min(0)
    private Integer availableSeats;

    private String imageUrl;

    @NotBlank
    private String category;



    // ── Tipo ──────────────────────────────────────────────────────
    private String type = "viaje";   // viaje | vuelo | escapada

    // ── Vuelo ─────────────────────────────────────────────────────
    private String  airline;
    private String  flightNumber;
    private String  cabinClass;
    private Boolean includesHotel = false;

    // ── Escapada ──────────────────────────────────────────────────
    private String  hotelName;
    private Integer hotelStars;
    private String  mealPlan;
    private String  highlight;

    private Double latitude;
    private Double longitude;
}