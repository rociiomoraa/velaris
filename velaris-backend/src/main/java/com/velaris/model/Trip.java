package com.velaris.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(nullable = false, length = 150)
    private String origin;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ── Tipo de producto ──────────────────────────────────────────
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String type = "viaje";   // viaje | vuelo | escapada

    // ── Campos de VUELO ──────────────────────────────────────────
    @Column(length = 100)
    private String airline;

    @Column(name = "flight_number", length = 20)
    private String flightNumber;

    @Column(name = "cabin_class", length = 20)
    private String cabinClass;       // turista | business | primera

    @Column(name = "includes_hotel")
    @Builder.Default
    private Boolean includesHotel = false;

    // ── Campos de ESCAPADA ────────────────────────────────────────
    @Column(name = "hotel_name", length = 150)
    private String hotelName;

    @Column(name = "hotel_stars")
    private Integer hotelStars;

    @Column(name = "meal_plan", length = 50)
    private String mealPlan;         // sin_comidas | desayuno | media_pension | todo_incluido

    @Column(length = 200)
    private String highlight;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (type == null) type = "viaje";
        if (active == null) active = true;
        if (includesHotel == null) includesHotel = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}