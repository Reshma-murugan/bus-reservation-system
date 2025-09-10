package com.busreservation.service;

import com.busreservation.entity.Bus;
import com.busreservation.entity.Seat;
import com.busreservation.repository.BusRepository;
import com.busreservation.repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SeatInitializationService {

    private final BusRepository busRepository;
    private final SeatRepository seatRepository;

    @Autowired
    public SeatInitializationService(BusRepository busRepository, SeatRepository seatRepository) {
        this.busRepository = busRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    public void initializeSeatsForBuses() {
        List<Bus> buses = busRepository.findAll();
        int seatsCreated = 0;
        
        for (Bus bus : buses) {
            // Check if seats already exist for this bus
            if (seatRepository.findByBusId(bus.getId()).isEmpty()) {
                List<Seat> seats = new ArrayList<>();
                int totalSeats = bus.getCapacity() != null ? bus.getCapacity() : 40; // Use bus capacity or default to 40
                
                // Create seats for the bus
                for (int i = 1; i <= totalSeats; i++) {
                    Seat seat = new Seat();
                    seat.setSeatNumber(String.format("%02d", i)); // Format as 01, 02, etc.
                    seat.setBus(bus);
                    seat.setAvailable(true);
                    seats.add(seat);
                }
                
                seatRepository.saveAll(seats);
                seatsCreated += seats.size();
                System.out.println("Created " + seats.size() + " seats for bus ID: " + bus.getId());
            } else {
                System.out.println("Seats already exist for bus ID: " + bus.getId());
            }
        }
        
        if (seatsCreated > 0) {
            System.out.println("Total seats created: " + seatsCreated);
        } else {
            System.out.println("No new seats were created - all buses already have seats");
        }
    }
}
