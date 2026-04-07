package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalTime;

/**
 * ResourceAvailability Entity - Represents availability windows for resources.
 */
@Entity
@Table(name = "ResourceAvailability")
public class ResourceAvailability {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ResourceId", nullable = false)
    private String resourceId;

    @Column(name = "DayOfWeek", nullable = false, length = 10)
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Column(name = "StartTime", nullable = false)
    private LocalTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalTime endTime;

    // Constructors
    public ResourceAvailability() {
    }

    public ResourceAvailability(String resourceId, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        this.resourceId = resourceId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}