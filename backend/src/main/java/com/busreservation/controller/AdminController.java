package com.busreservation.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.util.Arrays;

import com.busreservation.dto.BusRequest;
import com.busreservation.dto.SearchResponse;
import com.busreservation.dto.TodayBusStatusResponse;
import com.busreservation.entity.Booking;
import com.busreservation.entity.Bus;
import com.busreservation.service.AdminService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @PostMapping("/buses")
    public ResponseEntity<Bus> createBus(@Valid @RequestBody BusRequest request) {
        return ResponseEntity.ok(adminService.createBus(request));
    }
    
    @PutMapping("/buses/{id}")
    public ResponseEntity<Bus> updateBus(@PathVariable Long id, @Valid @RequestBody BusRequest request) {
        return ResponseEntity.ok(adminService.updateBus(id, request));
    }
    
    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(adminService.getAllBuses());
    }
    
    @GetMapping("/buses/{id}")
    public ResponseEntity<Bus> getBusById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBusById(id));
    }
    
    @GetMapping("/buses/today")
    public ResponseEntity<List<Bus>> getTodaysBuses() {
        return ResponseEntity.ok(adminService.getTodaysBuses());
    }
    
    @GetMapping("/buses/by-day/{dayOfWeek}")
    public ResponseEntity<List<Bus>> getBusesByDay(@PathVariable String dayOfWeek) {
        try {
            DayOfWeek day = DayOfWeek.valueOf(dayOfWeek.toUpperCase());
            return ResponseEntity.ok(adminService.getTodaysBuses(day));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid day of week. Must be one of: " + 
                Arrays.toString(DayOfWeek.values()));
        }
    }
    
    @GetMapping("/buses/today/status")
    public ResponseEntity<TodayBusStatusResponse> getTodaysBusesStatus() {
        return ResponseEntity.ok(adminService.getTodaysBusesStatus());
    }
    
    @GetMapping("/buses/search")
    public ResponseEntity<List<SearchResponse>> searchBuses(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(adminService.searchBuses(from, to, date));
    }
    
    @DeleteMapping("/buses/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable Long id) {
        adminService.deleteBus(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/fix-cumulative-fares")
    public ResponseEntity<String> fixCumulativeFares() {
        return ResponseEntity.ok(adminService.fixCumulativeFares());
    }
    
    @PostMapping("/cleanup-database")
    public ResponseEntity<String> cleanupDatabase() {
        try {
            String result = adminService.cleanupDatabase();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to cleanup database: " + e.getMessage());
        }
    }
    
    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }
    
    @PutMapping("/bookings/{bookingId}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam String status) {
        return ResponseEntity.ok(adminService.updateBookingStatus(bookingId, status));
    }
    
    // Simplified version of updateBookingStatus that only allows setting status to CANCELLED
    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.updateBookingStatus(bookingId, "CANCELLED"));
    }
}