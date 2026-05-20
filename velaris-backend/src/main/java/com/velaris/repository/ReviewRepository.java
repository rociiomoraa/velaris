package com.velaris.repository;

import com.velaris.model.Review;
import com.velaris.model.Trip;
import com.velaris.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByTripOrderByCreatedAtDesc(Trip trip, Pageable pageable);

    boolean existsByUserAndTrip(User user, Trip trip);

    Optional<Review> findByUserAndTrip(User user, Trip trip);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.trip = :trip")
    Double findAverageRatingByTrip(@Param("trip") Trip trip);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.trip = :trip")
    Long countByTrip(@Param("trip") Trip trip);

    List<Review> findAll();
}