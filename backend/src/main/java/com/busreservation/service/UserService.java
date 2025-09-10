package com.busreservation.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import com.busreservation.dto.BookingRequest;
import com.busreservation.dto.SearchResponse;
import com.busreservation.dto.SeatAvailabilityResponse;
import java.util.Collections;
import com.busreservation.entity.*;
import com.busreservation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import com.busreservation.entity.BookingStatus;

@Service
@Slf4j
public class UserService {
    private final BusRepository busRepository;
    private final BusStopRepository busStopRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StopRepository stopRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    @Autowired
    public UserService(BusRepository busRepository, 
                     BusStopRepository busStopRepository,
                     SeatRepository seatRepository,
                     BookingRepository bookingRepository,
                     UserRepository userRepository,
                     StopRepository stopRepository) {
        this.busRepository = busRepository;
        this.busStopRepository = busStopRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.stopRepository = stopRepository;
    }
    
    public List<SearchResponse> searchBuses(String from, String to, LocalDate date) {
        System.out.println("=== SEARCH REQUEST DEBUG ===");
        System.out.println("From: " + from + ", To: " + to + ", Date: " + date);
        
        // Validate date is not in the past
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot search for buses on past dates");
        }
        
        // Get the day of week for filtering
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        System.out.println("Day of Week: " + dayOfWeek);
        
        // Normalize the input (trim and convert to consistent case)
        String normalizedFrom = from.trim();
        String normalizedTo = to.trim();
        
        System.out.println("Normalized - From: " + normalizedFrom + ", To: " + normalizedTo);
        
        // Get buses for the route
        var allBuses = busRepository.findBusesForRoute(normalizedFrom, normalizedTo);
        System.out.println("Found " + allBuses.size() + " buses for route (before day filtering)");
        
        // Filter buses by day of week
        var buses = allBuses.stream()
                .filter(bus -> {
                    // Check if the bus operates on the requested day
                    boolean operatesOnDay = bus.getScheduleDays() == null || 
                                          bus.getScheduleDays().isEmpty() || 
                                          bus.getScheduleDays().contains(dayOfWeek);
                    System.out.println("Bus " + bus.getName() + " operates on " + dayOfWeek + ": " + operatesOnDay);
                    if (bus.getScheduleDays() != null) {
                        System.out.println("  Schedule days: " + bus.getScheduleDays());
                    }
                    return operatesOnDay;
                })
                .collect(Collectors.toList());
        
        System.out.println("Found " + buses.size() + " buses operating on " + dayOfWeek);
        
        if (buses.isEmpty()) {
            System.out.println("No buses found operating on " + dayOfWeek + ", returning empty list");
            return new ArrayList<>();
        }
        
        var results = new ArrayList<SearchResponse>();
        
        for (Bus bus : buses) {
            var busStops = busStopRepository.findByBusIdOrderBySequenceOrder(bus.getId());
            
            BusStop fromStop = null;
            BusStop toStop = null;
            
            for (BusStop busStop : busStops) {
                String stopName = busStop.getStop().getName().trim();
                if (stopName.equalsIgnoreCase(normalizedFrom)) {
                    fromStop = busStop;
                }
                if (stopName.equalsIgnoreCase(normalizedTo)) {
                    toStop = busStop;
                }
            }
            
            if (fromStop != null && toStop != null && fromStop.getSequenceOrder() < toStop.getSequenceOrder()) {
                // Use efficient cumulative fare calculation
                BigDecimal totalPrice = toStop.getCumulativeFare().subtract(fromStop.getCumulativeFare());
                
                var intermediateStops = new ArrayList<String>();
                
                System.out.println("=== CUMULATIVE FARE CALCULATION DEBUG ===");
                System.out.println("Journey: " + normalizedFrom + " -> " + normalizedTo);
                System.out.println("From Stop: " + fromStop.getStop().getName() + " (Cumulative: ₹" + fromStop.getCumulativeFare() + ")");
                System.out.println("To Stop: " + toStop.getStop().getName() + " (Cumulative: ₹" + toStop.getCumulativeFare() + ")");
                System.out.println("Total Fare: ₹" + toStop.getCumulativeFare() + " - ₹" + fromStop.getCumulativeFare() + " = ₹" + totalPrice);
                
                // Collect intermediate stops
                for (BusStop busStop : busStops) {
                    if (busStop.getSequenceOrder() > fromStop.getSequenceOrder() 
                        && busStop.getSequenceOrder() < toStop.getSequenceOrder()) {
                        intermediateStops.add(busStop.getStop().getName());
                    }
                }
                
                System.out.println("Intermediate Stops: " + intermediateStops);
                System.out.println("==========================================");
                
                var searchResponse = SearchResponse.builder()
                        .busId(bus.getId())
                        .busName(bus.getName())
                        .busType(bus.getType())
                        .operatorName(bus.getOperatorName())
                        .departureTime(fromStop.getArrivalTime())
                        .arrivalTime(toStop.getArrivalTime())
                        .totalPrice(totalPrice)
                        .intermediateStops(intermediateStops)
                        .fromSeq(fromStop.getSequenceOrder())
                        .toSeq(toStop.getSequenceOrder())
                        .build();
                
                results.add(searchResponse);
            }
        }
        
        return results;
    }
    
    public List<String> getAllStopNames() {
        return stopRepository.findAll().stream()
                .map(Stop::getName)
                .collect(Collectors.toList());
    }
    
    public List<Bus> searchBusesByIdOrName(String query) {
        if (query == null || query.trim().isEmpty()) {
            return busRepository.findAll();
        }
        
        String normalizedQuery = query.trim();
        
        // Try to parse as ID first
        try {
            Long id = Long.parseLong(normalizedQuery);
            Optional<Bus> busById = busRepository.findById(id);
            if (busById.isPresent()) {
                return List.of(busById.get());
            }
        } catch (NumberFormatException e) {
            // Not a number, search by name
        }
        
        // Search by name (case-insensitive, partial match)
        return busRepository.findAll().stream()
                .filter(bus -> bus.getName().toLowerCase().contains(normalizedQuery.toLowerCase()) ||
                              bus.getOperatorName().toLowerCase().contains(normalizedQuery.toLowerCase()) ||
                              bus.getType().toLowerCase().contains(normalizedQuery.toLowerCase()))
                .collect(Collectors.toList());
    }
    
    public List<SeatAvailabilityResponse> getSeatAvailability(Long busId, Integer fromSeq, Integer toSeq, LocalDate date) {
        var seats = seatRepository.findByBusId(busId);
        var results = new ArrayList<SeatAvailabilityResponse>();
        
        for (var seat : seats) {
            var conflictingBookings = bookingRepository.findConflictingBookings(
                    seat.getId(), date, fromSeq, toSeq
            );
            
            var available = conflictingBookings.isEmpty();
            
            results.add(SeatAvailabilityResponse.builder()
                    .seatId(seat.getId())
                    .seatNumber(seat.getSeatNumber())
                    .available(available)
                    .build());
        }
        
        return results;
    }
    
    public List<SeatAvailabilityResponse> getAllBusSeats(Long busId) {
        var seats = seatRepository.findByBusId(busId);
        var results = new ArrayList<SeatAvailabilityResponse>();
        
        for (var seat : seats) {
            results.add(SeatAvailabilityResponse.builder()
                    .seatId(seat.getId())
                    .seatNumber(seat.getSeatNumber())
                    .available(true) // Default to available since no date/route context
                    .build());
        }
        
        return results;
    }
    
    @Transactional(propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED, timeout = 30)
    public List<Booking> bookSeats(BookingRequest request, String userEmail) {
        // Validate journey date is not in the past
        if (request.getJourneyDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book seats for past dates");
        }
        
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        var bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        
        var bookings = new ArrayList<Booking>();
        
        // Calculate total amount using cumulative fare approach
        var busStops = busStopRepository.findByBusIdOrderBySequenceOrder(request.getBusId());
        
        BusStop fromStop = null;
        BusStop toStop = null;
        
        // Find the from and to stops by sequence order
        for (BusStop busStop : busStops) {
            if (busStop.getSequenceOrder().equals(request.getFromSeq())) {
                fromStop = busStop;
            }
            if (busStop.getSequenceOrder().equals(request.getToSeq())) {
                toStop = busStop;
            }
        }
        
        if (fromStop == null || toStop == null) {
            throw new RuntimeException("Invalid stop sequence numbers");
        }
        
        // Calculate fare using cumulative approach: destination - source
        BigDecimal totalPricePerSeat = toStop.getCumulativeFare().subtract(fromStop.getCumulativeFare());
        
        for (Long seatId : request.getSeatIds()) {
            // Check availability again (with locking to prevent race conditions)
            var conflictingBookings = bookingRepository.findConflictingBookings(
                    seatId, request.getJourneyDate(), request.getFromSeq(), request.getToSeq()
            );
            
            if (!conflictingBookings.isEmpty()) {
                throw new RuntimeException("Seat " + seatId + " is not available for the selected segment");
            }
            
            var seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new RuntimeException("Seat not found"));
            
            var booking = Booking.builder()
                    .user(user)
                    .bus(bus)
                    .seat(seat)
                    .fromSeq(request.getFromSeq())
                    .toSeq(request.getToSeq())
                    .fromStopName(fromStop.getStop().getName())
                    .toStopName(toStop.getStop().getName())
                    .journeyDate(request.getJourneyDate())
                    .amount(totalPricePerSeat)
                    .status(BookingStatus.CONFIRMED)
                    .build();
            
            try {
                Booking savedBooking = bookingRepository.save(booking);
                bookings.add(savedBooking);
                
                // Booking saved successfully
            } catch (Exception e) {
                log.error("Error saving booking for seat {}: {}", seatId, e.getMessage(), e);
                throw new RuntimeException("Failed to book seat " + seatId + ": " + e.getMessage());
            }
        }
        
        return bookings;
    }
    
    @Transactional
    public void requestRefund(Long bookingId, String userEmail, String reason) {
        throw new UnsupportedOperationException("Refund functionality has been removed");
    }
    
    /**
     * Retrieves all bookings for a user with proper status handling
     * @param userEmail The email of the user
     * @return List of bookings with their current status
     */
    public List<Booking> getUserBookings(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new IllegalArgumentException("User email cannot be empty");
        }
        
        try {
            // Find user by email
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
            
            // Get all bookings for user
            List<Booking> bookings = bookingRepository.findByUserId(user.getId());
            
            if (bookings == null || bookings.isEmpty()) {
                return Collections.emptyList();
            }
            
            // Sort bookings by journey date descending
            bookings.sort(Comparator.comparing(Booking::getJourneyDate).reversed());
            
            // Process each booking to set additional information and handle status
            for (Booking booking : bookings) {
                if (booking == null) {
                    continue;
                }
                
                try {
                    // Refund status checks removed
                    
                    if (booking.getBus() == null) {
                        System.err.println("WARN: Booking " + booking.getId() + " has no associated bus");
                        continue;
                    }
                    
                    if (booking.getFromSeq() == null || booking.getToSeq() == null) {
                        System.err.println("WARN: Booking " + booking.getId() + " has missing sequence numbers");
                        continue;
                    }
                    
                    // Find bus stops for this booking's bus
                    List<BusStop> stops = busStopRepository.findByBusIdOrderBySequenceOrder(booking.getBus().getId());
                    
                    if (stops == null || stops.isEmpty()) {
                        System.err.println("WARN: No stops found for bus " + booking.getBus().getId());
                        continue;
                    }
                    
                    // Set fromStopName if not already set
                    if (booking.getFromStopName() == null) {
                        String fromStopName = stops.stream()
                            .filter(bs -> bs != null && bs.getSequenceOrder() != null && bs.getSequenceOrder().equals(booking.getFromSeq()))
                            .findFirst()
                            .map(bs -> {
                                if (bs.getStop() == null) {
                                    System.err.println("WARN: BusStop " + bs.getId() + " has no associated Stop");
                                    return null;
                                }
                                return bs.getStop().getName();
                            })
                            .orElse("Stop " + booking.getFromSeq());
                        
                        if (fromStopName != null) {
                            booking.setFromStopName(fromStopName);
                        }
                    }
                    
                    // Set toStopName if not already set
                    if (booking.getToStopName() == null) {
                        String toStopName = stops.stream()
                            .filter(bs -> bs != null && bs.getSequenceOrder() != null && bs.getSequenceOrder().equals(booking.getToSeq()))
                            .findFirst()
                            .map(bs -> {
                                if (bs.getStop() == null) {
                                    System.err.println("WARN: BusStop " + bs.getId() + " has no associated Stop");
                                    return null;
                                }
                                return bs.getStop().getName();
                            })
                            .orElse("Stop " + booking.getToSeq());
                        
                        if (toStopName != null) {
                            booking.setToStopName(toStopName);
                        }
                    }
                    
                } catch (Exception e) {
                    System.err.println("ERROR processing booking " + (booking != null ? booking.getId() : "null") + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next booking
                }
            }
            
            // Filter out any null bookings and return
            return bookings.stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            System.err.println("Error retrieving user bookings: " + e.getMessage());
            throw new RuntimeException("Failed to retrieve bookings. Please try again later.", e);
        }
    }
    
    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        // Find the booking with seat and bus information
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Verify the booking belongs to the user
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own bookings");
        }
        
        // Get the seat associated with this booking
        Seat seat = booking.getSeat();
        if (seat != null) {
            // Mark the seat as available
            seat.setAvailable(true);
            seatRepository.save(seat);
            log.info("Seat {} marked as available after booking cancellation", seat.getId());
        }
        
        // Update status to cancelled
        booking.setStatus(com.busreservation.entity.BookingStatus.CANCELLED);
        booking.setUpdatedAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
        
        log.info("Booking {} cancelled by user {}", bookingId, userEmail);
    }
}