package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/*
 Resource Entity - Represents a facility or asset in the campus.
*/
@Entity
@Table(name = "Resources")
public class Resource {
    @Id
    private String id;

    @Column(name = "Name", nullable = false)
    private String name;

    @Column(name = "Type", nullable = false, length = 20)
    private String type; // ROOM, LAB, EQUIPMENT

    @Column(name = "Capacity")
    private Integer capacity;

    @Column(name = "Location", length = 150)
    private String location;

    @Column(name = "Status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, OUT_OF_SERVICE

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Resource() {
    }

    public Resource(String id, String name, String type, Integer capacity, 
                   String location, String status, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}