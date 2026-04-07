package com.smartcampus.backend.dto;

import java.util.List;

/* DTO for creating a resource request.*/
public class CreateResourceRequest {
    private String name;
    private String type; // ROOM, LAB, EQUIPMENT
    private Integer capacity;
    private String location;
    private String status; // ACTIVE, OUT_OF_SERVICE
    private String description;
    private List<AvailabilityWindow> availabilityWindows;

    public static class AvailabilityWindow {
        private String day; // MONDAY, TUESDAY, etc.
        private String startTime; // HH:mm format
        private String endTime; // HH:mm format

        public AvailabilityWindow() {}

        public AvailabilityWindow(String day, String startTime, String endTime) {
            this.day = day;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        // Getters and Setters
        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    // Constructors
    public CreateResourceRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<AvailabilityWindow> getAvailabilityWindows() { return availabilityWindows; }
    public void setAvailabilityWindows(List<AvailabilityWindow> availabilityWindows) { this.availabilityWindows = availabilityWindows; }
}
