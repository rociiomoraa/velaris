package com.velaris.dto.trip;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripResponse {

    private Long          id;
    private String        title;
    private String        description;
    private String        destination;
    private String        origin;
    private BigDecimal    price;
    private LocalDate     departureDate;
    private LocalDate     returnDate;
    private Integer       durationDays;
    private Integer       availableSeats;
    private String        imageUrl;
    private String        category;
    private Boolean       active;
    private LocalDateTime createdAt;

    // ── Tipo ──────────────────────────────────────────────────────
    private String  type;

    // ── Vuelo ─────────────────────────────────────────────────────
    private String  airline;
    private String  flightNumber;
    private String  cabinClass;
    private Boolean includesHotel;

    // ── Escapada ──────────────────────────────────────────────────
    private String  hotelName;
    private Integer hotelStars;
    private String  mealPlan;
    private String  highlight;

    // ── Coordenadas ───────────────────────────────────────────────
    private Double latitude;
    private Double longitude;
}