package com.velaris.service;

import com.velaris.dto.booking.BookingRequest;
import com.velaris.dto.booking.BookingResponse;
import com.velaris.exception.ApiException;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.*;
import com.velaris.repository.BookingRepository;
import com.velaris.repository.TripRepository;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository    tripRepository;
    private final UserRepository    userRepository;
    private final TripService       tripService;
    private final EmailService      emailService;

    @Transactional
    public BookingResponse create(String email, BookingRequest req) {
        User user = findUser(email);
        Trip trip = tripService.getTrip(req.getTripId());

        if (!trip.getActive()) {
            throw new ApiException("Este viaje no está disponible", HttpStatus.BAD_REQUEST);
        }
        if (trip.getAvailableSeats() < req.getNumTravelers()) {
            throw new ApiException("No hay suficientes plazas disponibles", HttpStatus.CONFLICT);
        }
        boolean hasActive = bookingRepository.existsByUserAndTripAndStatusNot(
                user, trip, BookingStatus.CANCELLED
        );
        if (hasActive) {
            throw new ApiException("Ya tienes una reserva activa para este viaje", HttpStatus.CONFLICT);
        }

        trip.setAvailableSeats(trip.getAvailableSeats() - req.getNumTravelers());
        tripRepository.save(trip); // ← persistir plazas descontadas

        BigDecimal total = trip.getPrice().multiply(BigDecimal.valueOf(req.getNumTravelers()));

        Booking booking = Booking.builder()
                .user(user)
                .trip(trip)
                .numTravelers(req.getNumTravelers())
                .totalPrice(total)
                .status(BookingStatus.PENDING)
                .notes(req.getNotes())
                .build();

        Booking saved = bookingRepository.save(booking);
        emailService.sendBookingConfirmation(saved);
        return toResponse(saved);
    }

    public Page<BookingResponse> myBookings(String email, int page, int size) {
        User user = findUser(email);
        return bookingRepository.findByUser(user,
                        PageRequest.of(page, size, Sort.by("bookedAt").descending()))
                .map(this::toResponse);
    }

    @Transactional
    public BookingResponse cancel(Long id, String email) {
        User user = findUser(email);
        Booking booking = bookingRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ApiException("La reserva ya está cancelada", HttpStatus.BAD_REQUEST);
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new ApiException("No se puede cancelar un viaje completado", HttpStatus.BAD_REQUEST);
        }

        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + booking.getNumTravelers());
        tripRepository.save(trip); // ← persistir plazas devueltas

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        emailService.sendBookingCancellation(saved);
        return toResponse(saved);
    }

    public Page<BookingResponse> allBookings(int page, int size) {
        return bookingRepository.findAll(
                        PageRequest.of(page, size, Sort.by("bookedAt").descending()))
                .map(this::toResponse);
    }

    public List<BookingResponse> allBookingsList() {
        return bookingRepository.findAll(Sort.by("bookedAt").descending())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada"));
        try {
            booking.setStatus(BookingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ApiException("Estado inválido: " + status, HttpStatus.BAD_REQUEST);
        }
        return toResponse(bookingRepository.save(booking));
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoCompleteBookings() {
        List<Booking> pending = bookingRepository.findByStatusIn(
                List.of(BookingStatus.CONFIRMED, BookingStatus.PENDING)
        );
        LocalDate today = LocalDate.now();
        pending.stream()
                .filter(b -> b.getTrip().getReturnDate().isBefore(today))
                .forEach(b -> {
                    b.setStatus(BookingStatus.COMPLETED);
                    bookingRepository.save(b);
                    log.info("Reserva {} marcada como COMPLETED automáticamente", b.getId());
                });
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    public BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                tripService.toResponse(b.getTrip()),
                b.getNumTravelers(),
                b.getTotalPrice(),
                b.getStatus().name(),
                b.getNotes(),
                b.getBookedAt(),
                b.getUpdatedAt()
        );
    }
}