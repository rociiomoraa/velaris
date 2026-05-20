package com.velaris.service;

import com.velaris.dto.trip.TripResponse;
import com.velaris.model.Trip;
import com.velaris.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final TripRepository tripRepository;

    @Cacheable("trips-active")
    public List<TripResponse> getCachedActiveTrips() {
        log.debug("Cargando catálogo desde BD (cache miss)");
        return tripRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "trips-active", allEntries = true)
    public void evictTripsCache() {
        log.debug("Caché de viajes invalidada");
    }

    private TripResponse toResponse(Trip t) {
        return new TripResponse(
                t.getId(), t.getTitle(), t.getDescription(), t.getDestination(),
                t.getOrigin(), t.getPrice(), t.getDepartureDate(), t.getReturnDate(),
                t.getDurationDays(), t.getAvailableSeats(), t.getImageUrl(),
                t.getCategory(), t.getActive(), t.getCreatedAt(),
                t.getType(),
                t.getAirline(), t.getFlightNumber(), t.getCabinClass(), t.getIncludesHotel(),
                t.getHotelName(), t.getHotelStars(), t.getMealPlan(), t.getHighlight(),
                t.getLatitude(), t.getLongitude()
        );
    }
}