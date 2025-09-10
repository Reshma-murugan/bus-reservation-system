package com.busreservation.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "trip_dates")
public class TripDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;
    
    private LocalDate serviceDate;

    public TripDate() {}

    public TripDate(Long id, Bus bus, LocalDate serviceDate) {
        this.id = id;
        this.bus = bus;
        this.serviceDate = serviceDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public LocalDate getServiceDate() { return serviceDate; }
    public void setServiceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private Bus bus;
        private LocalDate serviceDate;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bus(Bus bus) { this.bus = bus; return this; }
        public Builder serviceDate(LocalDate serviceDate) { this.serviceDate = serviceDate; return this; }
        public TripDate build() {
            return new TripDate(id, bus, serviceDate);
        }
    }
}