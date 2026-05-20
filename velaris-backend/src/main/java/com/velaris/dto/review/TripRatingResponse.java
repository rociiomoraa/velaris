package com.velaris.dto.review;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TripRatingResponse {
    private Double average;
    private Long total;
}