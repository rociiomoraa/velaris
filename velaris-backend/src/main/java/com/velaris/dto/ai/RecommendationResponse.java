package com.velaris.dto.ai;

import com.velaris.dto.trip.TripResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private String message;
    private List<TripResponse> trips;
}