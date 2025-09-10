package com.busreservation.dto;

import com.busreservation.entity.Booking;
import com.busreservation.entity.BusStop;
import java.util.ArrayList;
import java.util.List;

public class BookingResponseDTO {
    private Long bookingId;
    private String userName;
    private String busName;
    private String source;
    private String destination;
    private String travelDate;
    private List<String> seatNumbers;
    private double totalPrice;
    private String bookingStatus;

    // ✅ Default Constructor
    public BookingResponseDTO() {
    }

    // ✅ Constructor from Booking and BusStops
    public BookingResponseDTO(Booking booking, List<BusStop> busStops) {
        this.bookingId = booking.getId();
        this.userName = booking.getUser() != null ? booking.getUser().getName() : "Unknown";
        this.busName = booking.getBus() != null ? booking.getBus().getName() : "Unknown Bus";
        
        // Find source and destination from busStops
        if (busStops != null && !busStops.isEmpty()) {
            // Sort bus stops by sequence order
            busStops.sort((a, b) -> a.getSequenceOrder().compareTo(b.getSequenceOrder()));
            this.source = busStops.get(0).getStop().getName();
            this.destination = busStops.get(busStops.size() - 1).getStop().getName();
        } else {
            this.source = "Unknown";
            this.destination = "Unknown";
        }
        
        this.travelDate = booking.getJourneyDate() != null ? booking.getJourneyDate().toString() : "";
        this.seatNumbers = booking.getSeat() != null ? 
            List.of(booking.getSeat().getSeatNumber()) : 
            new ArrayList<>();
        this.totalPrice = booking.getAmount() != null ? booking.getAmount().doubleValue() : 0.0;
        this.bookingStatus = "CONFIRMED"; // Default status since Booking entity doesn't have status field
    }

    // ✅ Parameterized Constructor
    public BookingResponseDTO(Long bookingId, String userName, String busName, String source, String destination,
                               String travelDate, List<String> seatNumbers, double totalPrice, String bookingStatus) {
        this.bookingId = bookingId;
        this.userName = userName;
        this.busName = busName;
        this.source = source;
        this.destination = destination;
        this.travelDate = travelDate;
        this.seatNumbers = seatNumbers;
        this.totalPrice = totalPrice;
        this.bookingStatus = bookingStatus;
    }

    // ✅ Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getBusName() {
        return busName;
    }

    public void setBusName(String busName) {
        this.busName = busName;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(String travelDate) {
        this.travelDate = travelDate;
    }

    public List<String> getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(List<String> seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }
}
