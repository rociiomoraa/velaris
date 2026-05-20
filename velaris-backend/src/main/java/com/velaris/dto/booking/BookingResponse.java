package com.velaris.dto.booking;

import com.velaris.dto.trip.TripResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private TripResponse trip;
    private Integer numTravelers;
    private BigDecimal totalPrice;
    private String status;
    private String notes;
    private LocalDateTime bookedAt;
    private LocalDateTime updatedAt;
}