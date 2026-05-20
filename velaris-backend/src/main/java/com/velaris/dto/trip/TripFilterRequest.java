package com.velaris.dto.trip;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripFilterRequest {

    private String     type;
    private String     destination;
    private String     category;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private LocalDate  from;
    private LocalDate  to;
    private int        page;
    private int        size;
    private String     sort;
}