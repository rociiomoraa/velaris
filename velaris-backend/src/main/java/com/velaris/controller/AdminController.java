package com.velaris.controller;

import com.velaris.dto.admin.StatsResponse;
import com.velaris.dto.booking.BookingResponse;
import com.velaris.dto.trip.TripRequest;
import com.velaris.dto.trip.TripResponse;
import com.velaris.dto.user.UserResponse;
import com.velaris.service.BookingService;
import com.velaris.service.StatsService;
import com.velaris.service.TripService;
import com.velaris.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Administración")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final TripService    tripService;
    private final BookingService bookingService;
    private final StatsService   statsService;
    private final UserService    userService;

    @GetMapping("/stats")
    @Operation(summary = "Estadísticas generales del panel admin")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(statsService.getStats());
    }

    @PostMapping("/trips")
    @Operation(summary = "Crear viaje")
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest req) {
        return ResponseEntity.ok(tripService.create(req));
    }

    @PutMapping("/trips/{id}")
    @Operation(summary = "Actualizar viaje")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long id,
                                                   @Valid @RequestBody TripRequest req) {
        return ResponseEntity.ok(tripService.update(id, req));
    }

    @DeleteMapping("/trips/{id}")
    @Operation(summary = "Desactivar viaje (soft delete)")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/trips/{id}/toggle")
    @Operation(summary = "Activar / desactivar viaje")
    public ResponseEntity<TripResponse> toggleTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.toggleActive(id));
    }

    // ← NUEVO: viajes del admin paginados y ordenados por fecha
    @GetMapping("/trips/by-type")
    @Operation(summary = "Listar viajes por tipo, paginados y ordenados por fecha")
    public ResponseEntity<Page<TripResponse>> getTripsByType(
            @RequestParam String type,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(tripService.findAllAdmin(type, page, size));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Todas las reservas paginadas")
    public ResponseEntity<Page<BookingResponse>> allBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(bookingService.allBookings(page, size));
    }

    @PatchMapping("/bookings/{id}/status")
    @Operation(summary = "Actualizar estado de reserva")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateStatus(id, body.get("status")));
    }

    @GetMapping("/bookings/export")
    @Operation(summary = "Exportar reservas a CSV")
    public void exportBookings(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"reservas-velaris.csv\"");

        List<BookingResponse> bookings = bookingService.allBookingsList();
        PrintWriter writer = response.getWriter();
        writer.println("ID,Viaje,Destino,Viajeros,Total,Estado,Fecha");

        for (BookingResponse b : bookings) {
            writer.printf("%d,\"%s\",\"%s\",%d,%.2f,%s,%s%n",
                    b.getId(),
                    escapeCsv(b.getTrip().getTitle()),
                    escapeCsv(b.getTrip().getDestination()),
                    b.getNumTravelers(),
                    b.getTotalPrice(),
                    b.getStatus(),
                    b.getBookedAt() != null ? b.getBookedAt().toLocalDate() : ""
            );
        }
        writer.flush();
    }

    @PostMapping("/trips/geocode-all")
    @Operation(summary = "Geocodificar todos los viajes sin coordenadas")
    public ResponseEntity<String> geocodeAll() {
        int count = tripService.geocodeAllMissing();
        return ResponseEntity.ok("Geocodificados: " + count + " viajes");
    }

    @GetMapping("/users")
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/users/{id}/toggle")
    @Operation(summary = "Activar / desactivar cuenta de usuario")
    public ResponseEntity<UserResponse> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleEnabled(id));
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        return value.replace("\"", "\"\"");
    }
}