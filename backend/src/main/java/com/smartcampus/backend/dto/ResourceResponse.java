package com.smartcampus.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

// DTO for resource response.
public class ResourceResponse {
    private String id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private String description;
    private List<AvailabilityWindow> availabilityWindows;
    private LocalDateTime createdAt;

    public static class AvailabilityWindow {
        private String day;
        private String startTime;
        private String endTime;

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
    public ResourceResponse() {}

    public ResourceResponse(String id, String name, String type, Integer capacity, 
                           String location, String status, String description,
                           List<AvailabilityWindow> availabilityWindows, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.description = description;
        this.availabilityWindows = availabilityWindows;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

