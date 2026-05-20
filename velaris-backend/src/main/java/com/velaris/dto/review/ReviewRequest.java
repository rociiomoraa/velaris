package com.velaris.dto.review;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull
    private Long tripId;
    @NotNull @Min(1) @Max(5)
    private Integer rating;
    @Size(max = 1000)
    private String comment;
}