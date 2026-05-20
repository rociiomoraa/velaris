package com.velaris.dto.review;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long tripId;
    private Integer rating;
    private String comment;
    private String sentiment;
    private LocalDateTime createdAt;
}