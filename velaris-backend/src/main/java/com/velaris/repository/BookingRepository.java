package com.velaris.repository;

import com.velaris.model.Booking;
import com.velaris.model.BookingStatus;
import com.velaris.model.Trip;
import com.velaris.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUser(User user, Pageable pageable);

    List<Booking> findByTrip(Trip trip);

    boolean existsByUserAndTripAndStatusNot(User user, Trip trip, BookingStatus status);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByStatusIn(List<BookingStatus> statuses);

    List<Booking> findByStatusNot(BookingStatus status);

    List<Booking> findByUser(User user);

    Optional<Booking> findByIdAndUser(Long id, User user);

    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status != :status")
    BigDecimal sumTotalPriceExcludingStatus(@Param("status") BookingStatus status);
}