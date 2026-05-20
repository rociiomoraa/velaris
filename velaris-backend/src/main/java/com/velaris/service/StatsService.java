package com.velaris.service;

import com.velaris.dto.admin.StatsResponse;
import com.velaris.model.Booking;
import com.velaris.model.BookingStatus;
import com.velaris.repository.BookingRepository;
import com.velaris.repository.TripRepository;
import com.velaris.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository    userRepository;
    private final TripRepository    tripRepository;
    private final BookingRepository bookingRepository;

    public StatsResponse getStats() {

        // Totales básicos — queries agregadas, sin cargar entidades
        long totalUsers     = userRepository.count();
        long totalTrips     = tripRepository.count();
        long totalBookings  = bookingRepository.count();
        long pendingCount   = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedCount = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelledCount = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long completedCount = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        BigDecimal totalRevenue = bookingRepository.sumTotalPriceExcludingStatus(BookingStatus.CANCELLED);

        // Para los cálculos que requieren agrupación en memoria,
        // cargamos solo las reservas no canceladas
        List<Booking> activeBookings = bookingRepository.findByStatusNot(BookingStatus.CANCELLED);

        // Ingresos por mes — ordenados cronológicamente
        Map<YearMonth, BigDecimal> revenueMap = new TreeMap<>();
        Map<YearMonth, Long>       countMap   = new TreeMap<>();

        for (Booking b : activeBookings) {
            YearMonth ym = YearMonth.from(b.getBookedAt());
            revenueMap.merge(ym, b.getTotalPrice(), BigDecimal::add);
            countMap.merge(ym, 1L, Long::sum);
        }

        List<StatsResponse.MonthlyRevenue> revenueByMonth = revenueMap.entrySet().stream()
                .map(e -> {
                    String label = e.getKey().getMonth()
                            .getDisplayName(TextStyle.SHORT, new Locale("es"))
                            + " " + e.getKey().getYear();
                    return new StatsResponse.MonthlyRevenue(label, e.getValue(), countMap.get(e.getKey()));
                })
                .collect(Collectors.toList());

        // Top destinos
        List<StatsResponse.DestinationCount> topDestinations = activeBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getTrip().getDestination(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new StatsResponse.DestinationCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        // Reservas por categoría — incluye todas
        List<Booking> allBookings = bookingRepository.findAll(
                PageRequest.of(0, 1000, org.springframework.data.domain.Sort.unsorted())
        ).getContent();

        List<StatsResponse.CategoryCount> byCategory = allBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getTrip().getCategory(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> new StatsResponse.CategoryCount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        StatsResponse stats = new StatsResponse();
        stats.setTotalUsers(totalUsers);
        stats.setTotalTrips(totalTrips);
        stats.setTotalBookings(totalBookings);
        stats.setTotalRevenue(totalRevenue);
        stats.setPendingBookings(pendingCount);
        stats.setConfirmedBookings(confirmedCount);
        stats.setCancelledBookings(cancelledCount);
        stats.setCompletedBookings(completedCount);
        stats.setRevenueByMonth(revenueByMonth);
        stats.setTopDestinations(topDestinations);
        stats.setBookingsByCategory(byCategory);
        return stats;
    }
}