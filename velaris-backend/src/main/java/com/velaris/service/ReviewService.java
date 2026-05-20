package com.velaris.service;

import com.velaris.dto.review.ReviewRequest;
import com.velaris.dto.review.ReviewResponse;
import com.velaris.dto.review.TripRatingResponse;
import com.velaris.exception.ApiException;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.*;
import com.velaris.repository.BookingRepository;
import com.velaris.repository.ReviewRepository;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository  reviewRepository;
    private final UserRepository    userRepository;
    private final BookingRepository bookingRepository;
    private final TripService       tripService;
    private final AiAssistantService aiAssistantService;

    @Transactional
    public ReviewResponse create(String email, ReviewRequest req) {
        User user = findUser(email);
        Trip trip = tripService.getTrip(req.getTripId());

        if (reviewRepository.existsByUserAndTrip(user, trip)) {
            throw new ApiException("Ya has valorado este viaje", HttpStatus.CONFLICT);
        }
        boolean hasBooking = bookingRepository.existsByUserAndTripAndStatusNot(
                user, trip, BookingStatus.CANCELLED
        );
        if (!hasBooking) {
            throw new ApiException("Solo puedes valorar viajes reservados", HttpStatus.FORBIDDEN);
        }

        String sentiment = aiAssistantService.analyzeSentiment(req.getComment());

        Review review = Review.builder()
                .user(user)
                .trip(trip)
                .rating(req.getRating())
                .comment(req.getComment())
                .sentiment(sentiment)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public Page<ReviewResponse> getByTrip(Long tripId, int page, int size) {
        Trip trip = tripService.getTrip(tripId);
        return reviewRepository.findByTripOrderByCreatedAtDesc(
                        trip, PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(this::toResponse);
    }

    public TripRatingResponse getTripRating(Long tripId) {
        Trip trip = tripService.getTrip(tripId);
        Double avg   = reviewRepository.findAverageRatingByTrip(trip);
        Long   total = reviewRepository.countByTrip(trip);
        return new TripRatingResponse(avg != null ? avg : 0.0, total);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getName(),
                r.getTrip().getId(),
                r.getRating(),
                r.getComment(),
                r.getSentiment(),
                r.getCreatedAt()
        );
    }
}