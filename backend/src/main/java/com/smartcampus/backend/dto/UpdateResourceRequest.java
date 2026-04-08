package com.smartcampus.backend.dto;

import java.util.List;


//DTO for updating a resource request.
//All fields are optional for partial updates.
public class UpdateResourceRequest {
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private String description;
    private List<CreateResourceRequest.AvailabilityWindow> availabilityWindows;

    // Constructors
    public UpdateResourceRequest() {}

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
    public List<CreateResourceRequest.AvailabilityWindow> getAvailabilityWindows() { return availabilityWindows; }
    public void setAvailabilityWindows(List<CreateResourceRequest.AvailabilityWindow> availabilityWindows) { this.availabilityWindows = availabilityWindows; }
}

