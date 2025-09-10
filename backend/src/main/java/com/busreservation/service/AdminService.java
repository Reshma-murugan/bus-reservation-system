package com.busreservation.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import com.busreservation.dto.BusRequest;
import com.busreservation.dto.SearchResponse;
import com.busreservation.dto.TodayBusStatusResponse;
import com.busreservation.entity.Booking;
import com.busreservation.entity.BookingStatus;
import com.busreservation.entity.Bus;
import com.busreservation.entity.BusStop;
import com.busreservation.entity.Seat;
import com.busreservation.entity.Stop;
import com.busreservation.repository.BookingRepository;
import com.busreservation.repository.BusRepository;
import com.busreservation.repository.BusStopRepository;
import com.busreservation.repository.SeatRepository;
import com.busreservation.repository.StopRepository;
import com.busreservation.repository.TripDateRepository;
import com.busreservation.repository.UserRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AdminService {

    private final BusRepository busRepository;
    private final StopRepository stopRepository;
    private final BusStopRepository busStopRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final TripDateRepository tripDateRepository;
    private final UserRepository userRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public AdminService(BusRepository busRepository,
                       StopRepository stopRepository,
                       BusStopRepository busStopRepository,
                       SeatRepository seatRepository,
                       BookingRepository bookingRepository,
                       TripDateRepository tripDateRepository,
                       UserRepository userRepository,
                       PaymentService paymentService) {
        this.busRepository = busRepository;
        this.stopRepository = stopRepository;
        this.busStopRepository = busStopRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.tripDateRepository = tripDateRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Bus createBus(BusRequest request) {
        try {
            // Convert schedule days from strings to DayOfWeek enum
            Set<DayOfWeek> scheduleDays = new HashSet<>();
            if (request.getScheduleDays() != null && !request.getScheduleDays().isEmpty()) {
                for (String dayString : request.getScheduleDays()) {
                    try {
                        scheduleDays.add(DayOfWeek.valueOf(dayString.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Invalid day of week: " + dayString);
                    }
                }
            } else {
                // Default to all days if no schedule provided
                scheduleDays.addAll(Set.of(DayOfWeek.values()));
            }

            // Create bus
            Bus bus = Bus.builder()
                    .name(request.getName())
                    .type(request.getType())
                    .capacity(request.getCapacity())
                    .operatorName(request.getOperatorName())
                    .scheduleDays(scheduleDays)
                    .build();

            // Create bus stops
            List<BusStop> busStops = new ArrayList<>();
            for (int i = 0; i < request.getStops().size(); i++) {
                var stopRequest = request.getStops().get(i);

                Stop stop = stopRepository.findByName(stopRequest.getStopName())
                        .orElseGet(() -> {
                            Stop newStop = new Stop();
                            newStop.setName(stopRequest.getStopName());
                            newStop.setCityCode(stopRequest.getStopName().substring(0, 3).toUpperCase());
                            return stopRepository.save(newStop);
                        });

                LocalTime arrivalTime = LocalTime.parse(stopRequest.getArrivalTime(), DateTimeFormatter.ofPattern("HH:mm"));

                BusStop busStop = BusStop.builder()
                        .bus(bus)
                        .stop(stop)
                        .arrivalTime(arrivalTime)
                        .priceFromPrev(stopRequest.getPriceFromPrev())
                        .sequenceOrder(i + 1)
                        .build();

                busStops.add(busStop);
            }

            bus.setBusStops(busStops);

            // Calculate cumulative fares
            busStops.sort((a, b) -> Integer.compare(a.getSequenceOrder(), b.getSequenceOrder()));
            BigDecimal cumulativeFare = BigDecimal.ZERO;
            for (BusStop busStop : busStops) {
                cumulativeFare = cumulativeFare.add(busStop.getPriceFromPrev());
                busStop.setCumulativeFare(cumulativeFare);
            }

            // Create seats
            List<Seat> seats = new ArrayList<>();
            for (int i = 1; i <= request.getCapacity(); i++) {
                seats.add(Seat.builder()
                        .bus(bus)
                        .seatNumber(String.valueOf(i))
                        .build());
            }
            bus.setSeats(seats);

            return busRepository.save(bus);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create bus: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Bus updateBus(Long id, BusRequest request) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        // Update basic fields
        bus.setName(request.getName());
        bus.setType(request.getType());
        bus.setCapacity(request.getCapacity());
        bus.setOperatorName(request.getOperatorName());

        // Update schedule days
        Set<DayOfWeek> scheduleDays = new HashSet<>();
        if (request.getScheduleDays() != null && !request.getScheduleDays().isEmpty()) {
            for (String dayString : request.getScheduleDays()) {
                try {
                    scheduleDays.add(DayOfWeek.valueOf(dayString.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid day of week: " + dayString);
                }
            }
        } else {
            // Default to all days if no schedule provided
            scheduleDays.addAll(Set.of(DayOfWeek.values()));
        }
        bus.setScheduleDays(scheduleDays);

        // Clear existing stops and seats
        bus.getBusStops().clear();
        bus.getSeats().clear();

        // Create new bus stops
        List<BusStop> busStops = new ArrayList<>();
        for (int i = 0; i < request.getStops().size(); i++) {
            var stopRequest = request.getStops().get(i);

            Stop stop = stopRepository.findByName(stopRequest.getStopName())
                    .orElseGet(() -> {
                        Stop newStop = new Stop();
                        newStop.setName(stopRequest.getStopName());
                        newStop.setCityCode(stopRequest.getStopName().substring(0, 3).toUpperCase());
                        return stopRepository.save(newStop);
                    });

            LocalTime arrivalTime = LocalTime.parse(stopRequest.getArrivalTime(), DateTimeFormatter.ofPattern("HH:mm"));

            BusStop busStop = BusStop.builder()
                    .bus(bus)
                    .stop(stop)
                    .arrivalTime(arrivalTime)
                    .priceFromPrev(stopRequest.getPriceFromPrev())
                    .sequenceOrder(i + 1)
                    .build();

            busStops.add(busStop);
        }

        bus.setBusStops(busStops);

        // Calculate cumulative fares
        busStops.sort((a, b) -> Integer.compare(a.getSequenceOrder(), b.getSequenceOrder()));
        BigDecimal cumulativeFare = BigDecimal.ZERO;
        for (BusStop busStop : busStops) {
            cumulativeFare = cumulativeFare.add(busStop.getPriceFromPrev());
            busStop.setCumulativeFare(cumulativeFare);
        }

        // Create new seats
        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= request.getCapacity(); i++) {
            seats.add(Seat.builder()
                    .bus(bus)
                    .seatNumber(String.valueOf(i))
                    .build());
        }
        bus.setSeats(seats);

        return busRepository.save(bus);
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));
    }

    /**
     * Get buses that run on the specified day of the week.
     * If no day is specified, uses the current day.
     * @param dayOfWeek Optional day of week to check (defaults to current day)
     * @return List of buses that run on the specified day
     */
    public List<Bus> getTodaysBuses(DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) {
            dayOfWeek = LocalDate.now().getDayOfWeek();
        }
        
        System.out.println("=== GETTING BUSES FOR " + dayOfWeek + " ===");

        // Fetch all buses with their stops and related data
        List<Bus> allBuses = busRepository.findAllWithStops();
        List<Bus> daysBuses = new ArrayList<>();

        for (Bus bus : allBuses) {
            boolean runsOnDay = bus.getScheduleDays() == null ||
                              bus.getScheduleDays().isEmpty() ||
                              (bus.getScheduleDays() != null && bus.getScheduleDays().contains(dayOfWeek));

            System.out.println("Bus: " + bus.getName() +
                             " | Schedule: " + (bus.getScheduleDays() != null ? bus.getScheduleDays() : "No schedule") +
                             " | Runs on " + dayOfWeek + ": " + runsOnDay);

            if (runsOnDay) {
                // Ensure bus stops are properly initialized and sorted
                if (bus.getBusStops() != null) {
                    bus.setBusStops(bus.getBusStops().stream()
                        .filter(bs -> bs != null && bs.getSequenceOrder() != null)
                        .sorted(Comparator.comparingInt(BusStop::getSequenceOrder))
                        .collect(Collectors.toList()));
                }
                daysBuses.add(bus);
            }
        }

        System.out.println("Total buses running on " + dayOfWeek + ": " + daysBuses.size());
        return daysBuses;
    }
    
    /**
     * Overload for backward compatibility
     */
    public List<Bus> getTodaysBuses() {
        return getTodaysBuses(null);
    }

    public int countBookedSeatsForBusToday(Long busId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        return bookingRepository.countByBusIdAndCreatedAtBetween(
            busId, 
            startOfDay, 
            endOfDay
        );
    }

    public TodayBusStatusResponse getTodaysBusesStatus() {
        System.out.println("=== GETTING TODAY'S BUS STATUS ===");
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        System.out.println("Today is: " + today + " (" + dayOfWeek + ")");

        try {
            System.out.println("Fetching all buses...");
            List<Bus> allBuses = busRepository.findAll();
            System.out.println("Total buses found: " + allBuses.size());
            
            List<TodayBusStatusResponse.BusStatusInfo> runningBuses = new ArrayList<>();
            List<TodayBusStatusResponse.BusStatusInfo> notRunningBuses = new ArrayList<>();

            for (Bus bus : allBuses) {
                try {
                    System.out.println("Processing bus: " + bus.getId() + " - " + bus.getName());
                    System.out.println("Schedule days: " + (bus.getScheduleDays() != null ? bus.getScheduleDays() : "null"));
                    
                    boolean runsToday = bus.getScheduleDays() == null ||
                                     bus.getScheduleDays().isEmpty() ||
                                     (bus.getScheduleDays() != null && bus.getScheduleDays().contains(dayOfWeek));

                    // Create route string
                    String route = "N/A";
                    try {
                        if (bus.getBusStops() != null && !bus.getBusStops().isEmpty()) {
                            var sortedStops = bus.getBusStops().stream()
                                .filter(bs -> bs != null && bs.getSequenceOrder() != null)
                                .sorted((a, b) -> Integer.compare(a.getSequenceOrder(), b.getSequenceOrder()))
                                .toList();
                            if (sortedStops.size() >= 2) {
                                route = sortedStops.get(0).getStop().getName() + " → " +
                                       sortedStops.get(sortedStops.size() - 1).getStop().getName();
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing route for bus " + bus.getId() + ": " + e.getMessage());
                        route = "Error loading route";
                    }

                    // Convert schedule days to strings
                    List<String> scheduleDaysStr = new ArrayList<>();
                    try {
                        if (bus.getScheduleDays() != null) {
                            scheduleDaysStr = bus.getScheduleDays().stream()
                                .map(day -> day != null ? day.toString() : "null")
                                .sorted()
                                .toList();
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing bus " + (bus != null ? bus.getId() : "null") + ": " + e.getMessage());
                        e.printStackTrace();
                        // Continue with next bus even if one fails
                    }

                    int totalSeats = bus.getCapacity() != null ? bus.getCapacity() : 0;
                    
                    TodayBusStatusResponse.BusStatusInfo busInfo = new TodayBusStatusResponse.BusStatusInfo(
                        bus.getId(),
                        bus.getName() != null ? bus.getName() : "Unnamed Bus",
                        bus.getType() != null ? bus.getType() : "Unknown",
                        bus.getOperatorName() != null ? bus.getOperatorName() : "Unknown",
                        totalSeats,
                        scheduleDaysStr,
                        route
                    );

                    if (runsToday) {
                        runningBuses.add(busInfo);
                    } else {
                        notRunningBuses.add(busInfo);
                    }
                } catch (Exception e) {
                    System.err.println("Error processing bus " + (bus != null ? bus.getId() : "null") + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continue with next bus even if one fails
                }
            }

            int totalBuses = allBuses.size();
            int busesRunningToday = runningBuses.size();

            System.out.println("Total buses: " + totalBuses);
            System.out.println("Running today: " + busesRunningToday);
            System.out.println("Not running today: " + notRunningBuses.size());

            return new TodayBusStatusResponse(
                today,
                dayOfWeek,
                totalBuses,
                busesRunningToday,
                runningBuses,
                notRunningBuses
            );
        } catch (Exception e) {
            System.err.println("Fatal error in getTodaysBusesStatus: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get today's bus status: " + e.getMessage(), e);
        }
    }

    public List<SearchResponse> searchBuses(String from, String to, LocalDate date) {
        System.out.println("=== ADMIN SEARCH REQUEST ===");
        System.out.println("From: " + from + ", To: " + to + ", Date: " + date);

        // ... (rest of the code remains the same)
        // Normalize the input
        String normalizedFrom = from.trim();
        String normalizedTo = to.trim();

        System.out.println("Normalized - From: " + normalizedFrom + ", To: " + normalizedTo);

        // Get buses for the route
        var allBuses = busRepository.findBusesForRoute(normalizedFrom, normalizedTo);
        System.out.println("Found " + allBuses.size() + " buses for route (before date filtering)");

        List<Bus> buses;

        if (date != null) {
            // Filter by day of week if date is provided
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            System.out.println("Filtering by day of week: " + dayOfWeek);

            buses = allBuses.stream()
                    .filter(bus -> {
                        boolean operatesOnDay = bus.getScheduleDays() == null ||
                                              bus.getScheduleDays().isEmpty() ||
                                              bus.getScheduleDays().contains(dayOfWeek);
                        System.out.println("Admin Search - Bus " + bus.getName() + " operates on " + dayOfWeek + ": " + operatesOnDay);
                        if (bus.getScheduleDays() != null) {
                            System.out.println("  Schedule days: " + bus.getScheduleDays());
                        }
                        return operatesOnDay;
                    })
                    .toList();

            System.out.println("Found " + buses.size() + " buses operating on " + dayOfWeek);
        } else {
            // No date filter - return all buses for the route
            buses = allBuses;
            System.out.println("No date filter - returning all " + buses.size() + " buses for route");
        }

        if (buses.isEmpty()) {
            System.out.println("No buses found for the search criteria");
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
                // Calculate fare using cumulative fare
                BigDecimal totalPrice = toStop.getCumulativeFare().subtract(fromStop.getCumulativeFare());

                var intermediateStops = new ArrayList<String>();

                System.out.println("=== ADMIN SEARCH RESULT ===");
                System.out.println("Bus: " + bus.getName());
                System.out.println("Journey: " + normalizedFrom + " -> " + normalizedTo);
                System.out.println("From Stop: " + fromStop.getStop().getName() + " (Cumulative: ₹" + fromStop.getCumulativeFare() + ")");
                System.out.println("To Stop: " + toStop.getStop().getName() + " (Cumulative: ₹" + toStop.getCumulativeFare() + ")");
                System.out.println("Total Fare: ₹" + totalPrice);

                // Collect intermediate stops
                for (BusStop busStop : busStops) {
                    if (busStop.getSequenceOrder() > fromStop.getSequenceOrder()
                        && busStop.getSequenceOrder() < toStop.getSequenceOrder()) {
                        intermediateStops.add(busStop.getStop().getName());
                    }
                }

                System.out.println("Intermediate Stops: " + intermediateStops);
                System.out.println("Schedule Days: " + bus.getScheduleDays());
                System.out.println("================================");

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

        System.out.println("Admin search returning " + results.size() + " results");
        return results;
    }

    public void deleteBus(Long id) {
        busRepository.deleteById(id);
    }

    @Transactional
    public String fixCumulativeFares() {
        List<Bus> buses = busRepository.findAll();
        int updatedCount = 0;
        
        for (Bus bus : buses) {
            List<BusStop> stops = busStopRepository.findByBusIdOrderBySequenceOrder(bus.getId());
            if (stops.size() > 1) {
                // Only update if we have at least 2 stops
                boolean needsUpdate = false;
                for (int i = 1; i < stops.size(); i++) {
                    BusStop current = stops.get(i);
                    if (current.getCumulativeFare() == null || current.getCumulativeFare().compareTo(BigDecimal.ZERO) <= 0) {
                        needsUpdate = true;
                        break;
                    }
                }
                
                if (needsUpdate) {
                    // Recalculate cumulative fares
                    BigDecimal cumulativeFare = BigDecimal.ZERO;
                    for (int i = 0; i < stops.size(); i++) {
                        BusStop current = stops.get(i);
                        if (i > 0) {
                            // Use priceFromPrev for fare calculation
                            BigDecimal fare = current.getPriceFromPrev() != null ? current.getPriceFromPrev() : BigDecimal.ZERO;
                            cumulativeFare = cumulativeFare.add(fare);
                            current.setCumulativeFare(cumulativeFare);
                            busStopRepository.save(current);
                        } else {
                            current.setCumulativeFare(BigDecimal.ZERO);
                            busStopRepository.save(current);
                        }
                    }
                    updatedCount++;
                }
            }
        }
        
        return "Updated cumulative fares for " + updatedCount + " buses";
    }

    public String cleanupDatabase() {
    // Delete all dependent entities first to avoid foreign key constraint issues
    seatRepository.deleteAll();
    busStopRepository.deleteAll();
    bookingRepository.deleteAll();
    tripDateRepository.deleteAll();
    busRepository.deleteAll();
    stopRepository.deleteAll();
    userRepository.deleteAll();
    return "✅ Database cleaned: all buses, stops, seats, bookings, trip dates, and users deleted.";
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllBookings() {
    try {
        log.info("=== FETCHING ALL BOOKINGS (with fresh data) ===");
        
        // Clear the persistence context to ensure we get fresh data from the database
        entityManager.clear();
        
        // Fetch all bookings with a fresh query, ordered by ID descending (newest first)
        List<Booking> bookings = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        
        log.info("Total bookings found: {}", bookings.size());
        
        // Log the status of the first few bookings for debugging
        int logCount = Math.min(bookings.size(), 5);
        for (int i = 0; i < logCount; i++) {
            Booking b = bookings.get(i);
            log.info("Booking {} - ID: {}, Status: {}, Last Updated: {}", 
                    i+1, b.getId(), b.getStatus(), b.getUpdatedAt());
        }
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Booking booking : bookings) {
            try {
                Map<String, Object> bookingMap = new HashMap<>();
                
                // Basic booking info
                bookingMap.put("id", booking.getId());
                bookingMap.put("bookingDate", booking.getCreatedAt());
                // Add journey date at root level to match frontend expectations
                bookingMap.put("journeyDate", booking.getJourneyDate() != null ? booking.getJourneyDate().toString() : null);
                
                // Handle status safely
                try {
                    bookingMap.put("status", booking.getStatus() != null ? booking.getStatus().name() : "UNKNOWN");
                } catch (Exception e) {
                    System.err.println("Error getting status for booking " + booking.getId() + ": " + e.getMessage());
                    bookingMap.put("status", "ERROR");
                }
                
                bookingMap.put("totalAmount", booking.getAmount() != null ? booking.getAmount().doubleValue() : 0.0);
                
                // User info
                if (booking.getUser() != null) {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("firstName", booking.getUser().getName());
                    userMap.put("email", booking.getUser().getEmail());
                    // Add phone if available
                    bookingMap.put("user", userMap);
                }
                
                // Trip and bus info
                if (booking.getBus() != null) {
                    Map<String, Object> tripDateMap = new HashMap<>();
                    tripDateMap.put("serviceDate", booking.getJourneyDate());
                    
                    Map<String, Object> busMap = new HashMap<>();
                    busMap.put("name", booking.getBus().getName());
                    busMap.put("type", booking.getBus().getType());
                    busMap.put("operatorName", booking.getBus().getOperatorName());
                    
                    tripDateMap.put("bus", busMap);
                    bookingMap.put("tripDate", tripDateMap);
                    
                    // Get bus stops for from/to info
                    List<BusStop> busStops = busStopRepository.findByBusIdOrderBySequenceOrder(booking.getBus().getId());
                    if (busStops != null && !busStops.isEmpty()) {
                        // Find from stop
                        BusStop fromStop = busStops.stream()
                            .filter(stop -> stop.getSequenceOrder().equals(booking.getFromSeq()))
                            .findFirst()
                            .orElse(null);
                        
                        // Find to stop
                        BusStop toStop = busStops.stream()
                            .filter(stop -> stop.getSequenceOrder().equals(booking.getToSeq()))
                            .findFirst()
                            .orElse(null);
                        
                        if (fromStop != null) {
                            Map<String, Object> fromStopMap = new HashMap<>();
                            fromStopMap.put("name", fromStop.getStop() != null ? fromStop.getStop().getName() : "Unknown");
                            fromStopMap.put("arrivalTime", fromStop.getArrivalTime() != null ? fromStop.getArrivalTime().toString() : null);
                            bookingMap.put("fromStop", fromStopMap);
                        }
                        
                        if (toStop != null) {
                            Map<String, Object> toStopMap = new HashMap<>();
                            toStopMap.put("name", toStop.getStop() != null ? toStop.getStop().getName() : "Unknown");
                            toStopMap.put("arrivalTime", toStop.getArrivalTime() != null ? toStop.getArrivalTime().toString() : null);
                            bookingMap.put("toStop", toStopMap);
                        }
                    }
                }
                
                // Seat info
                if (booking.getSeat() != null) {
                    List<Map<String, Object>> seatsList = new ArrayList<>();
                    Map<String, Object> seatMap = new HashMap<>();
                    seatMap.put("seatNumber", booking.getSeat().getSeatNumber());
                    seatsList.add(seatMap);
                    bookingMap.put("seats", seatsList);
                } else {
                    bookingMap.put("seats", new ArrayList<>());
                }
                
                result.add(bookingMap);
            } catch (Exception e) {
                System.err.println("Error processing booking " + booking.getId() + ": " + e.getMessage());
                e.printStackTrace();
                // Add minimal error info to result
                Map<String, Object> errorMap = new HashMap<>();
                errorMap.put("id", booking != null ? booking.getId() : "unknown");
                errorMap.put("error", "Error processing booking: " + e.getMessage());
                result.add(errorMap);
            }
        }
        
        System.out.println("Successfully processed " + result.size() + " bookings");
        return result;
    } catch (Exception e) {
        System.err.println("FATAL ERROR in getAllBookings: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to retrieve bookings: " + e.getMessage(), e);
    }
    }
    
    @Transactional
    public Booking updateBookingStatus(Long bookingId, String status) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
                
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            
            booking.setStatus(bookingStatus);
            return bookingRepository.save(booking);
            
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Must be one of: " + 
                Arrays.toString(BookingStatus.values()));
        }
    }
}
