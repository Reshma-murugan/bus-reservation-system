package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BusStopRequest {
    @NotBlank
    private String stopName;
    
    @NotBlank
    private String arrivalTime;
    
    @NotNull
    private BigDecimal priceFromPrev;

    public BusStopRequest() {}

    public BusStopRequest(String stopName, String arrivalTime, BigDecimal priceFromPrev) {
        this.stopName = stopName;
        this.arrivalTime = arrivalTime;
        this.priceFromPrev = priceFromPrev;
    }

    public String getStopName() { return stopName; }
    public void setStopName(String stopName) { this.stopName = stopName; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public BigDecimal getPriceFromPrev() { return priceFromPrev; }
    public void setPriceFromPrev(BigDecimal priceFromPrev) { this.priceFromPrev = priceFromPrev; }
}