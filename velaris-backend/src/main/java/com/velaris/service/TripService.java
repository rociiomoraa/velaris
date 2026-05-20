package com.velaris.service;

import com.velaris.dto.trip.TripFilterRequest;
import com.velaris.dto.trip.TripRequest;
import com.velaris.dto.trip.TripResponse;
import com.velaris.exception.ResourceNotFoundException;
import com.velaris.model.Trip;
import com.velaris.repository.TripRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
public class TripService {

    private final TripRepository   tripRepository;
    private final GeocodingService geocodingService;
    private final CacheService     cacheService;

    public Page<TripResponse> findAll(TripFilterRequest filter) {
        int page = filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSize() > 0  ? filter.getSize() : 9;

        Sort sort = switch (filter.getSort() != null ? filter.getSort() : "") {
            case "price_asc"  -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "duration"   -> Sort.by("durationDays").ascending();
            case "date_desc"  -> Sort.by("departureDate").descending();
            case "newest"     -> Sort.by("id").descending();
            default           -> Sort.by("departureDate").ascending();
        };

        Pageable pageable = PageRequest.of(page, size, sort);
        return tripRepository.findWithFilters(
                isEmpty(filter.getType())        ? null : filter.getType(),
                isEmpty(filter.getDestination()) ? null : filter.getDestination(),
                isEmpty(filter.getCategory())    ? null : filter.getCategory(),
                null,
                filter.getMinPrice(),
                filter.getMaxPrice(),
                filter.getFrom(),
                filter.getTo(),
                pageable
        ).map(this::toResponse);
    }

    public Page<TripResponse> findByType(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departureDate").ascending());
        return tripRepository.findByTypeAndActiveTrue(type, pageable).map(this::toResponse);
    }

    public Page<TripResponse> findEscapadas(String destination, String mealPlan,
                                            BigDecimal minPrice, BigDecimal maxPrice,
                                            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("price").ascending());
        return tripRepository.findWithFilters(
                "escapada",
                isEmpty(destination) ? null : destination,
                null,
                isEmpty(mealPlan)    ? null : mealPlan,
                minPrice,
                maxPrice,
                null,
                null,
                pageable
        ).map(this::toResponse);
    }

    public Page<TripResponse> findFlights(String destination, String cabinClass,
                                          Boolean includesHotel,
                                          BigDecimal minPrice, BigDecimal maxPrice,
                                          int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departureDate").ascending());
        return tripRepository.findFlightsWithFilters(
                isEmpty(destination) ? null : destination,
                isEmpty(cabinClass)  ? null : cabinClass,
                includesHotel,
                minPrice,
                maxPrice,
                pageable
        ).map(this::toResponse);
    }

    public TripResponse findById(Long id) {
        return toResponse(getTrip(id));
    }

    @Transactional
    public TripResponse create(TripRequest req) {
        Trip trip = buildTrip(new Trip(), req);
        TripResponse response = toResponse(tripRepository.save(trip));
        cacheService.evictTripsCache();
        return response;
    }

    @Transactional
    public TripResponse update(Long id, TripRequest req) {
        Trip trip = getTrip(id);
        buildTrip(trip, req);
        TripResponse response = toResponse(tripRepository.save(trip));
        cacheService.evictTripsCache();
        return response;
    }

    @Transactional
    public void delete(Long id) {
        Trip trip = getTrip(id);
        trip.setActive(false);
        tripRepository.save(trip);
        cacheService.evictTripsCache();
    }

    @Transactional
    public TripResponse toggleActive(Long id) {
        Trip trip = getTrip(id);
        trip.setActive(!Boolean.TRUE.equals(trip.getActive()));
        TripResponse response = toResponse(tripRepository.save(trip));
        cacheService.evictTripsCache();
        return response;
    }

    // ← NUEVO: se ejecuta al arrancar la aplicación
    @PostConstruct
    @Transactional
    public void init() {
        autoDeactivatePastTrips();
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void autoDeactivatePastTrips() {
        List<Trip> trips = tripRepository.findByActiveTrue();
        LocalDate today = LocalDate.now();
        trips.stream()
                .filter(t -> t.getDepartureDate() != null && t.getDepartureDate().isBefore(today))
                .forEach(t -> {
                    t.setActive(false);
                    tripRepository.save(t);
                    log.info("Viaje {} '{}' desactivado automáticamente por fecha pasada", t.getId(), t.getTitle());
                });
        cacheService.evictTripsCache();
    }

    // ← NUEVO: para el admin, paginado y ordenado por fecha descendente
    public Page<TripResponse> findAllAdmin(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("departureDate").descending());
        return tripRepository.findByType(type, pageable).map(this::toResponse);
    }

    public List<TripResponse> findSimilar(Long tripId) {
        Trip trip = getTrip(tripId);
        Pageable p = PageRequest.of(0, 3);
        return tripRepository.findByCategoryAndIdNotAndActiveTrue(trip.getCategory(), tripId, p)
                .getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TripResponse findRandom() {
        List<Trip> trips = tripRepository.findRandom(PageRequest.of(0, 1));
        if (trips.isEmpty()) throw new ResourceNotFoundException("No hay viajes disponibles");
        return toResponse(trips.get(0));
    }

    public List<TripResponse> findAllActive() {
        return tripRepository.findByActiveTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public Trip getTrip(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado con id: " + id));
    }

    public TripResponse toResponse(Trip t) {
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

    @Transactional
    public int geocodeAllMissing() {
        List<Trip> trips = tripRepository.findByLatitudeIsNullOrLongitudeIsNull();
        int count = 0;
        for (Trip trip : trips) {
            double[] coords = geocodingService.getCoordinates(trip.getDestination());
            if (coords != null) {
                trip.setLatitude(coords[0]);
                trip.setLongitude(coords[1]);
                count++;
                log.info("Geocodificado: {} → [{}, {}]", trip.getDestination(), coords[0], coords[1]);
            }
            try { Thread.sleep(1100); } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        tripRepository.saveAll(trips);
        return count;
    }

    private Trip buildTrip(Trip trip, TripRequest req) {
        trip.setTitle(req.getTitle());
        trip.setDescription(req.getDescription());
        trip.setDestination(req.getDestination());
        trip.setOrigin(req.getOrigin() != null ? req.getOrigin() : "Madrid");
        trip.setPrice(req.getPrice());
        trip.setDepartureDate(req.getDepartureDate());
        trip.setReturnDate(req.getReturnDate());
        trip.setDurationDays(req.getDurationDays());
        trip.setAvailableSeats(req.getAvailableSeats());
        trip.setImageUrl(req.getImageUrl());
        trip.setCategory(req.getCategory());
        trip.setActive(true);
        trip.setType(req.getType() != null ? req.getType() : "viaje");
        trip.setAirline(req.getAirline());
        trip.setFlightNumber(req.getFlightNumber());
        trip.setCabinClass(req.getCabinClass());
        trip.setIncludesHotel(req.getIncludesHotel() != null ? req.getIncludesHotel() : false);
        trip.setHotelName(req.getHotelName());
        trip.setHotelStars(req.getHotelStars());
        trip.setMealPlan(req.getMealPlan());
        trip.setHighlight(req.getHighlight());

        if (req.getLatitude() != null && req.getLongitude() != null) {
            trip.setLatitude(req.getLatitude());
            trip.setLongitude(req.getLongitude());
        } else if (trip.getLatitude() == null || trip.getLongitude() == null) {
            double[] coords = geocodingService.getCoordinates(req.getDestination());
            if (coords != null) {
                trip.setLatitude(coords[0]);
                trip.setLongitude(coords[1]);
            }
        }

        return trip;
    }

    private boolean isEmpty(String s) {
        return s == null || s.isBlank();
    }
}