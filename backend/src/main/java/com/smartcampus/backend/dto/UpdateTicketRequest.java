package com.smartcampus.backend.dto;

/**
 * Request body for PATCH /api/tickets/{id}
 *
 * Used by ADMIN to change status / assign technician,
 * and by TECHNICIAN to add resolution notes.
 *
 * All fields are optional – only non-null fields will be applied.
 */
public class UpdateTicketRequest {

    /** Optional. OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED */
    private String status;

    /** Optional. User ID of the technician to assign (ADMIN only). */
    private String assignedTo;

    /** Optional. Text notes written by the technician about their resolution. */
    private String resolutionNotes;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}