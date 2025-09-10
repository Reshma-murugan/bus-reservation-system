package com.busreservation.dto;

public class SeatAvailabilityResponse {
    private Long seatId;
    private String seatNumber;
    private Boolean available;

    public SeatAvailabilityResponse() {}

    public SeatAvailabilityResponse(Long seatId, String seatNumber, Boolean available) {
        this.seatId = seatId;
        this.seatNumber = seatNumber;
        this.available = available;
    }

    public Long getSeatId() { return seatId; }
    public void setSeatId(Long seatId) { this.seatId = seatId; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long seatId;
        private String seatNumber;
        private Boolean available;

        public Builder seatId(Long seatId) { this.seatId = seatId; return this; }
        public Builder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
        public Builder available(Boolean available) { this.available = available; return this; }
        public SeatAvailabilityResponse build() {
            return new SeatAvailabilityResponse(seatId, seatNumber, available);
        }
    }
}