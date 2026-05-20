package com.velaris.dto.booking;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    @NotNull
    private Long tripId;
    @NotNull @Min(1)
    private Integer numTravelers;
    private String notes;
}