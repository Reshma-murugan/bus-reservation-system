package com.busreservation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class BookingRequest {
    @NotNull
    private Long busId;
    
    @NotNull
    private LocalDate journeyDate;
    
    @NotEmpty
    private List<Long> seatIds;
    
    @NotNull
    private Integer fromSeq;
    
    @NotNull
    private Integer toSeq;

    public BookingRequest() {}

    public BookingRequest(Long busId, LocalDate journeyDate, List<Long> seatIds, Integer fromSeq, Integer toSeq) {
        this.busId = busId;
        this.journeyDate = journeyDate;
        this.seatIds = seatIds;
        this.fromSeq = fromSeq;
        this.toSeq = toSeq;
    }

    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public LocalDate getJourneyDate() { return journeyDate; }
    public void setJourneyDate(LocalDate journeyDate) { this.journeyDate = journeyDate; }
    public List<Long> getSeatIds() { return seatIds; }
    public void setSeatIds(List<Long> seatIds) { this.seatIds = seatIds; }
    public Integer getFromSeq() { return fromSeq; }
    public void setFromSeq(Integer fromSeq) { this.fromSeq = fromSeq; }
    public Integer getToSeq() { return toSeq; }
    public void setToSeq(Integer toSeq) { this.toSeq = toSeq; }
}