package com.busreservation.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

public class SearchResponse {
    private Long busId;
    private String busName;
    private String busType;
    private String operatorName;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private BigDecimal totalPrice;
    private List<String> intermediateStops;
    private Integer fromSeq;
    private Integer toSeq;

    public SearchResponse() {}

    public SearchResponse(Long busId, String busName, String busType, String operatorName, 
                         LocalTime departureTime, LocalTime arrivalTime, BigDecimal totalPrice,
                         List<String> intermediateStops, Integer fromSeq, Integer toSeq) {
        this.busId = busId;
        this.busName = busName;
        this.busType = busType;
        this.operatorName = operatorName;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.totalPrice = totalPrice;
        this.intermediateStops = intermediateStops;
        this.fromSeq = fromSeq;
        this.toSeq = toSeq;
    }

    // Getters and Setters
    public Long getBusId() { return busId; }
    public void setBusId(Long busId) { this.busId = busId; }
    public String getBusName() { return busName; }
    public void setBusName(String busName) { this.busName = busName; }
    public String getBusType() { return busType; }
    public void setBusType(String busType) { this.busType = busType; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }
    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public List<String> getIntermediateStops() { return intermediateStops; }
    public void setIntermediateStops(List<String> intermediateStops) { this.intermediateStops = intermediateStops; }
    public Integer getFromSeq() { return fromSeq; }
    public void setFromSeq(Integer fromSeq) { this.fromSeq = fromSeq; }
    public Integer getToSeq() { return toSeq; }
    public void setToSeq(Integer toSeq) { this.toSeq = toSeq; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long busId;
        private String busName;
        private String busType;
        private String operatorName;
        private LocalTime departureTime;
        private LocalTime arrivalTime;
        private BigDecimal totalPrice;
        private List<String> intermediateStops;
        private Integer fromSeq;
        private Integer toSeq;

        public Builder busId(Long busId) { this.busId = busId; return this; }
        public Builder busName(String busName) { this.busName = busName; return this; }
        public Builder busType(String busType) { this.busType = busType; return this; }
        public Builder operatorName(String operatorName) { this.operatorName = operatorName; return this; }
        public Builder departureTime(LocalTime departureTime) { this.departureTime = departureTime; return this; }
        public Builder arrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; return this; }
        public Builder totalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; return this; }
        public Builder intermediateStops(List<String> intermediateStops) { this.intermediateStops = intermediateStops; return this; }
        public Builder fromSeq(Integer fromSeq) { this.fromSeq = fromSeq; return this; }
        public Builder toSeq(Integer toSeq) { this.toSeq = toSeq; return this; }
        public SearchResponse build() {
            return new SearchResponse(busId, busName, busType, operatorName, departureTime, arrivalTime, 
                                    totalPrice, intermediateStops, fromSeq, toSeq);
        }
    }
}