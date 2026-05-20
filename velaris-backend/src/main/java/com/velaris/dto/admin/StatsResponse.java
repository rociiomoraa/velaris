package com.velaris.dto.admin;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {

    private Long totalUsers;
    private Long totalTrips;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private Long completedBookings;

    private List<MonthlyRevenue> revenueByMonth;
    private List<DestinationCount> topDestinations;
    private List<CategoryCount> bookingsByCategory;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenue {
        private String month;
        private BigDecimal revenue;
        private Long bookings;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinationCount {
        private String destination;
        private Long count;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryCount {
        private String category;
        private Long count;
    }
}