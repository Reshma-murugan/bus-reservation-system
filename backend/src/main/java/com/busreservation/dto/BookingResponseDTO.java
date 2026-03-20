package com.busreservation.dto;

import com.busreservation.entity.Booking;
import com.busreservation.entity.BusStop;
import java.util.ArrayList;
import java.util.List;

public class BookingResponseDTO {
    private Long id;
    private String userName;
    private String busName;
    private String busType;
    private String operatorName;
    private String fromStopName;
    private String toStopName;
    private Integer fromSeq;
    private Integer toSeq;
    private String journeyDate;
    private String boardingTime;
    private List<String> seatNumbers;
    private double amount;
    private String status;
    private String createdAt;

    // ✅ Default Constructor
    public BookingResponseDTO() {
    }

    // ✅ Constructor from Booking and BusStops
    public BookingResponseDTO(Booking booking, List<BusStop> busStops) {
        this.id = booking.getId();
        this.userName = booking.getUser() != null ? booking.getUser().getName() : "Unknown";
        this.busName = booking.getBus() != null ? booking.getBus().getName() : "Unknown Bus";
        this.busType = booking.getBus() != null ? booking.getBus().getType() : "Standard";
        this.operatorName = booking.getBus() != null ? booking.getBus().getOperatorName() : "Unknown Operator";
        this.fromSeq = booking.getFromSeq();
        this.toSeq = booking.getToSeq();
        
        // Find stops and boarding time
        if (busStops != null && !busStops.isEmpty()) {
            BusStop fromStop = busStops.stream()
                .filter(bs -> bs.getSequenceOrder().equals(booking.getFromSeq()))
                .findFirst()
                .orElse(null);
            
            BusStop toStop = busStops.stream()
                .filter(bs -> bs.getSequenceOrder().equals(booking.getToSeq()))
                .findFirst()
                .orElse(null);
            
            this.fromStopName = fromStop != null ? fromStop.getStop().getName() : booking.getFromStopName();
            this.toStopName = toStop != null ? toStop.getStop().getName() : booking.getToStopName();
            this.boardingTime = fromStop != null && fromStop.getArrivalTime() != null ? fromStop.getArrivalTime().toString() : "N/A";
        } else {
            this.fromStopName = booking.getFromStopName();
            this.toStopName = booking.getToStopName();
            this.boardingTime = "N/A";
        }
        
        this.journeyDate = booking.getJourneyDate() != null ? booking.getJourneyDate().toString() : "";
        this.seatNumbers = booking.getSeat() != null ? 
            List.of(booking.getSeat().getSeatNumber()) : 
            new ArrayList<>();
        this.amount = booking.getAmount() != null ? booking.getAmount().doubleValue() : 0.0;
        this.status = booking.getStatus() != null ? booking.getStatus().name() : "CONFIRMED";
        this.createdAt = booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "";
    }

    // ✅ Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }
    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
    public String getFromStopName() { return fromStopName; }
    public void setFromStopName(String fromStopName) { this.fromStopName = fromStopName; }
    public String getToStopName() { return toStopName; }
    public void setToStopName(String toStopName) { this.toStopName = toStopName; }
    public Integer getFromSeq() { return fromSeq; }
    public void setFromSeq(Integer fromSeq) { this.fromSeq = fromSeq; }
    public Integer getToSeq() { return toSeq; }
    public void setToSeq(Integer toSeq) { this.toSeq = toSeq; }
    public String getJourneyDate() { return journeyDate; }
    public void setJourneyDate(String journeyDate) { this.journeyDate = journeyDate; }
    public String getBoardingTime() { return boardingTime; }
    public void setBoardingTime(String boardingTime) { this.boardingTime = boardingTime; }
    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
