package com.smartcampus.backend.dto;

import java.time.Instant;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateBookingRequest {

    @NotBlank(message = "resourceId is required")
    private String resourceId;

    @NotNull(message = "startTime is required")
    @Future(message = "startTime must be in the future")
    private Instant startTime;

    @NotNull(message = "endTime is required")
    @Future(message = "endTime must be in the future")
    private Instant endTime;

    @NotBlank(message = "purpose is required")
    @Size(max = 500, message = "purpose must be at most 500 characters")
    private String purpose;

    @Min(value = 1, message = "expectedAttendees must be at least 1")
    private Integer expectedAttendees;

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }
}
