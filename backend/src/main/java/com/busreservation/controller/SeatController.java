package com.busreservation.controller;

import com.busreservation.service.SeatInitializationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seats")
public class SeatController {
    private final SeatInitializationService seatInitializationService;

    public SeatController(SeatInitializationService seatInitializationService) {
        this.seatInitializationService = seatInitializationService;
    }

    @PostMapping("/initialize")
    public ResponseEntity<String> initializeSeats() {
        try {
            seatInitializationService.initializeSeatsForBuses();
            return ResponseEntity.ok("Seats initialized successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to initialize seats: " + e.getMessage());
        }
    }
}
