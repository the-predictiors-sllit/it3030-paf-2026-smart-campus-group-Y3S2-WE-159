package com.smartcampus.backend.dto;

/**
 * DTO for updating booking status.
 * Used for admin approval/rejection or user cancellation.
 */
public class UpdateBookingStatusRequest {
    private String status; // APPROVED, REJECTED, CANCELLED
    private String reason; // Optional reason/comment

    // Constructors
    public UpdateBookingStatusRequest() {
    }

    public UpdateBookingStatusRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
