
package com.busreservation.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.Positive;

import com.busreservation.dto.BookingRequest;
import com.busreservation.dto.SearchResponse;
import com.busreservation.dto.SeatAvailabilityResponse;
import com.busreservation.entity.Booking;
import com.busreservation.service.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Controller for user-specific operations.
 * All endpoints in this controller require USER or ADMIN role.
 */
@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
@Validated
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<SearchResponse>> searchBuses(
            @RequestParam @NotBlank(message = "Departure location is required") String from,
            @RequestParam @NotBlank(message = "Arrival location is required") String to,
            @RequestParam @NotNull(message = "Date is required") 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(userService.searchBuses(from, to, date));
    }
    
    @GetMapping("/debug/stops")
    public ResponseEntity<List<String>> getAllStopNames() {
        return ResponseEntity.ok(userService.getAllStopNames());
    }
    
    @GetMapping("/buses/{busId}/seats")
    public ResponseEntity<List<SeatAvailabilityResponse>> getSeatAvailability(
            @PathVariable Long busId,
            @RequestParam Integer fromSeq,
            @RequestParam Integer toSeq,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(userService.getSeatAvailability(busId, fromSeq, toSeq, date));
    }
    
    @PostMapping("/book")
    public ResponseEntity<List<Booking>> bookSeats(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.bookSeats(request, authentication.getName()));
    }
    
    @GetMapping("/bookings/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyBookings(Authentication authentication) {
        try {
            var bookings = userService.getUserBookings(authentication.getName());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            System.err.println("Error in getMyBookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching bookings: " + e.getMessage());
        }
    }
    
    @PatchMapping("/bookings/{bookingId}/cancel")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, String>> cancelBooking(
            @PathVariable @Positive(message = "Booking ID must be positive") Long bookingId,
            Authentication authentication) {
        String username = authentication.getName();
        if (username == null || username.trim().isEmpty()) {
            throw new SecurityException("User not authenticated");
        }
        
        userService.cancelBooking(bookingId, username);
        return ResponseEntity.ok(Map.of(
            "success", "true",
            "message", "Booking cancelled successfully"
        ));
    }
}
