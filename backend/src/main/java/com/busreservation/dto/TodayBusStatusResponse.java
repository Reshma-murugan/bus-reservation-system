package com.busreservation.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

public class TodayBusStatusResponse {
    private LocalDate today;
    private DayOfWeek dayOfWeek;
    private int totalBuses;
    private int busesRunningToday;
    private List<BusStatusInfo> runningBuses;
    private List<BusStatusInfo> notRunningBuses;

    public TodayBusStatusResponse() {}

    public TodayBusStatusResponse(LocalDate today, DayOfWeek dayOfWeek, int totalBuses, 
                                 int busesRunningToday, List<BusStatusInfo> runningBuses, 
                                 List<BusStatusInfo> notRunningBuses) {
        this.today = today;
        this.dayOfWeek = dayOfWeek;
        this.totalBuses = totalBuses;
        this.busesRunningToday = busesRunningToday;
        this.runningBuses = runningBuses;
        this.notRunningBuses = notRunningBuses;
    }

    // Getters and Setters
    public LocalDate getToday() { return today; }
    public void setToday(LocalDate today) { this.today = today; }
    public DayOfWeek getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(DayOfWeek dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public int getTotalBuses() { return totalBuses; }
    public void setTotalBuses(int totalBuses) { this.totalBuses = totalBuses; }
    public int getBusesRunningToday() { return busesRunningToday; }
    public void setBusesRunningToday(int busesRunningToday) { this.busesRunningToday = busesRunningToday; }
    public List<BusStatusInfo> getRunningBuses() { return runningBuses; }
    public void setRunningBuses(List<BusStatusInfo> runningBuses) { this.runningBuses = runningBuses; }
    public List<BusStatusInfo> getNotRunningBuses() { return notRunningBuses; }
    public void setNotRunningBuses(List<BusStatusInfo> notRunningBuses) { this.notRunningBuses = notRunningBuses; }

    // Inner class for bus status info
    public static class BusStatusInfo {
        private Long id;
        private String name;
        private String type;
        private String operatorName;
        private int capacity;
        private List<String> scheduleDays;
        private String route; // "From → To"

        public BusStatusInfo() {}

        public BusStatusInfo(Long id, String name, String type, String operatorName, 
                           int capacity, List<String> scheduleDays, String route) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.operatorName = operatorName;
            this.capacity = capacity;
            this.scheduleDays = scheduleDays;
            this.route = route;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getOperatorName() { return operatorName; }
        public void setOperatorName(String operatorName) { this.operatorName = operatorName; }
        public int getCapacity() { return capacity; }
        public void setCapacity(int capacity) { this.capacity = capacity; }
        public List<String> getScheduleDays() { return scheduleDays; }
        public void setScheduleDays(List<String> scheduleDays) { this.scheduleDays = scheduleDays; }
        public String getRoute() { return route; }
        public void setRoute(String route) { this.route = route; }
    }
}
