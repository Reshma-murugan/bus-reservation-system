package com.busreservation.entity;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "buses")
public class Bus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String type;

    @NotNull
    private Integer capacity;

    @NotBlank
    private String operatorName;

    @NotNull
    private Integer totalSeats = 40; // Default to 40 seats

    private Boolean active = true;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "bus_schedule_days", joinColumns = @JoinColumn(name = "bus_id"))
    private Set<DayOfWeek> scheduleDays = new HashSet<>();

    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<BusStop> busStops = new ArrayList<>();

    @OneToMany(mappedBy = "bus", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("bus-seats")
    private List<Seat> seats = new ArrayList<>();

    public Bus() {}

    public Bus(Long id, String name, String type, Integer capacity, String operatorName, Boolean active, Set<DayOfWeek> scheduleDays, List<BusStop> busStops, List<Seat> seats) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.operatorName = operatorName;
        this.active = active;
        this.scheduleDays = scheduleDays != null ? scheduleDays : new HashSet<>();
        this.busStops = busStops != null ? busStops : new ArrayList<>();
        this.seats = seats != null ? seats : new ArrayList<>();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Set<DayOfWeek> getScheduleDays() {
        return scheduleDays;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public void setScheduleDays(Set<DayOfWeek> scheduleDays) { this.scheduleDays = scheduleDays; }
    public List<BusStop> getBusStops() { return busStops; }
    public void setBusStops(List<BusStop> busStops) { this.busStops = busStops; }
    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String name;
        private String type;
        private Integer capacity;
        private String operatorName;
        private Boolean active = true;
        private Set<DayOfWeek> scheduleDays = new HashSet<>();
        private List<BusStop> busStops = new ArrayList<>();
        private List<Seat> seats = new ArrayList<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public Builder operatorName(String operatorName) { this.operatorName = operatorName; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder scheduleDays(Set<DayOfWeek> scheduleDays) { this.scheduleDays = scheduleDays; return this; }
        public Builder busStops(List<BusStop> busStops) { this.busStops = busStops; return this; }
        public Builder seats(List<Seat> seats) { this.seats = seats; return this; }
        public Bus build() {
            return new Bus(id, name, type, capacity, operatorName, active, scheduleDays, busStops, seats);
        }
    }
}