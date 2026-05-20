package com.velaris.repository;

import com.velaris.model.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    @Query("""
        SELECT t FROM Trip t
        WHERE t.active = true
          AND (:type        IS NULL OR t.type = :type)
          AND (:destination IS NULL OR LOWER(t.destination) LIKE LOWER(CONCAT('%', CAST(:destination AS string), '%')))
          AND (:category    IS NULL OR t.category = :category)
          AND (:mealPlan    IS NULL OR t.mealPlan = :mealPlan)
          AND (:minPrice    IS NULL OR t.price >= :minPrice)
          AND (:maxPrice    IS NULL OR t.price <= :maxPrice)
          AND (:fromDate    IS NULL OR t.departureDate >= :fromDate)
          AND (:toDate      IS NULL OR t.departureDate <= :toDate)
        """)
    Page<Trip> findWithFilters(
            @Param("type")        String type,
            @Param("destination") String destination,
            @Param("category")    String category,
            @Param("mealPlan")    String mealPlan,
            @Param("minPrice")    BigDecimal minPrice,
            @Param("maxPrice")    BigDecimal maxPrice,
            @Param("fromDate")    LocalDate fromDate,
            @Param("toDate")      LocalDate toDate,
            Pageable pageable
    );

    @Query("""
        SELECT t FROM Trip t
        WHERE t.active = true
          AND t.type = 'vuelo'
          AND (:destination  IS NULL OR LOWER(t.destination) LIKE LOWER(CONCAT('%', CAST(:destination AS string), '%')))
          AND (:cabinClass   IS NULL OR t.cabinClass = :cabinClass)
          AND (:includesHotel IS NULL OR t.includesHotel = :includesHotel)
          AND (:minPrice     IS NULL OR t.price >= :minPrice)
          AND (:maxPrice     IS NULL OR t.price <= :maxPrice)
        """)
    Page<Trip> findFlightsWithFilters(
            @Param("destination")   String destination,
            @Param("cabinClass")    String cabinClass,
            @Param("includesHotel") Boolean includesHotel,
            @Param("minPrice")      BigDecimal minPrice,
            @Param("maxPrice")      BigDecimal maxPrice,
            Pageable pageable
    );

    Page<Trip> findByTypeAndActiveTrue(String type, Pageable pageable);

    Page<Trip> findByTypeAndActiveTrueAndDurationDaysLessThanEqual(
            String type, Integer maxDays, Pageable pageable);

    List<Trip> findByLatitudeIsNullOrLongitudeIsNull();

    Page<Trip> findByCategoryAndIdNotAndActiveTrue(String category, Long id, Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.active = true ORDER BY FUNCTION('RANDOM')")
    List<Trip> findRandom(Pageable pageable);

    List<Trip> findByActiveTrue();

    Page<Trip> findByType(String type, Pageable pageable);  // ← NUEVO
}