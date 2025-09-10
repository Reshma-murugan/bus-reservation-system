package com.busreservation.entity;

import java.math.BigDecimal;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "bus_stops")
public class BusStop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    @JsonBackReference
    private Bus bus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stop_id")
    private Stop stop;

    @NotNull
    private Integer sequenceOrder;

    @NotNull
    private LocalTime arrivalTime;

    @NotNull
    private BigDecimal priceFromPrev = BigDecimal.ZERO;
    
    // Cumulative fare from the starting stop to this stop
    @NotNull
    private BigDecimal cumulativeFare = BigDecimal.ZERO;

    public BusStop() {}

    public BusStop(Long id, Bus bus, Stop stop, Integer sequenceOrder, LocalTime arrivalTime, BigDecimal priceFromPrev) {
        this.id = id;
        this.bus = bus;
        this.stop = stop;
        this.sequenceOrder = sequenceOrder;
        this.arrivalTime = arrivalTime;
        this.priceFromPrev = priceFromPrev != null ? priceFromPrev : BigDecimal.ZERO;
        this.cumulativeFare = BigDecimal.ZERO; // Will be calculated during bus creation
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public Stop getStop() { return stop; }
    public void setStop(Stop stop) { this.stop = stop; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public BigDecimal getPriceFromPrev() { return priceFromPrev; }
    public void setPriceFromPrev(BigDecimal priceFromPrev) { this.priceFromPrev = priceFromPrev; }
    public BigDecimal getCumulativeFare() { return cumulativeFare; }
    public void setCumulativeFare(BigDecimal cumulativeFare) { this.cumulativeFare = cumulativeFare; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private Bus bus;
        private Stop stop;
        private Integer sequenceOrder;
        private LocalTime arrivalTime;
        private BigDecimal priceFromPrev = BigDecimal.ZERO;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bus(Bus bus) { this.bus = bus; return this; }
        public Builder stop(Stop stop) { this.stop = stop; return this; }
        public Builder sequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; return this; }
        public Builder arrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; return this; }
        public Builder priceFromPrev(BigDecimal priceFromPrev) { this.priceFromPrev = priceFromPrev; return this; }
        public BusStop build() {
            return new BusStop(id, bus, stop, sequenceOrder, arrivalTime, priceFromPrev);
        }
    }
}