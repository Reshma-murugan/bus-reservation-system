package com.busreservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Set;

public class BusRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String type;
    
    @NotNull
    private Integer capacity;
    
    @NotBlank
    private String operatorName;
    
    @NotEmpty
    private List<BusStopRequest> stops;
    
    private Set<String> scheduleDays; // ["MONDAY", "FRIDAY", etc.]

    public BusRequest() {}

    public BusRequest(String name, String type, Integer capacity, String operatorName, List<BusStopRequest> stops, Set<String> scheduleDays) {
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.operatorName = operatorName;
        this.stops = stops;
        this.scheduleDays = scheduleDays;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
    public List<BusStopRequest> getStops() { return stops; }
    public void setStops(List<BusStopRequest> stops) { this.stops = stops; }
    public Set<String> getScheduleDays() { return scheduleDays; }
    public void setScheduleDays(Set<String> scheduleDays) { this.scheduleDays = scheduleDays; }
}