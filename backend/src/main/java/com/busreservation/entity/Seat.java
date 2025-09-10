package com.busreservation.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "seats")
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bus_id")
    @JsonBackReference("bus-seats")
    private Bus bus;

    @NotBlank
    private String seatNumber;
    
    private boolean available = true;

    public Seat() {}

    public Seat(Long id, Bus bus, String seatNumber) {
        this.id = id;
        this.bus = bus;
        this.seatNumber = seatNumber;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Bus getBus() { return bus; }
    public void setBus(Bus bus) { this.bus = bus; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private Bus bus;
        private String seatNumber;
        private boolean available = true;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder bus(Bus bus) { this.bus = bus; return this; }
        public Builder seatNumber(String seatNumber) { this.seatNumber = seatNumber; return this; }
        public Builder available(boolean available) { this.available = available; return this; }
        public Seat build() {
            Seat seat = new Seat(id, bus, seatNumber);
            seat.setAvailable(available);
            return seat;
        }
    }
}