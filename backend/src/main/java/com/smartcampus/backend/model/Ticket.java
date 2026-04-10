package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Ticket Entity - Represents a maintenance / incident report.
 *
 * Category : HARDWARE | PLUMBING | ELECTRICAL | SOFTWARE | OTHER
 * Priority : LOW | MEDIUM | HIGH | CRITICAL
 * Status   : OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED
 *
 * Maps to the "Tickets" table defined in the database schema.
 */
@Entity
@Table(name = "Tickets")
public class Ticket {

    @Id
    @Column(name = "Id", length = 50)
    private String id;

    /**
     * Optional - ticket may reference a tracked campus resource (room, lab, equipment).
     * If the issue is in a general location (e.g. cafeteria) this can be null.
     */
    @Column(name = "ResourceId", length = 50)
    private String resourceId;

    /** Free-text location used when no specific resource is linked (e.g. "Cafeteria, Zone A"). */
    @Column(name = "Location", length = 150)
    private String location;

    /** HARDWARE | PLUMBING | ELECTRICAL | SOFTWARE | OTHER */
    @Column(name = "Category", nullable = false, length = 30)
    private String category;

    /** LOW | MEDIUM | HIGH | CRITICAL */
    @Column(name = "Priority", nullable = false, length = 20)
    private String priority;

    /** OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED  – starts as OPEN */
    @Column(name = "Status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "Description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "ContactPhone", length = 20)
    private String contactPhone;

    /** User ID of the person who reported the issue. */
    @Column(name = "CreatedBy", nullable = false, length = 50)
    private String createdBy;

    /** User ID of the technician / staff member assigned to fix it. Nullable. */
    @Column(name = "AssignedTo", length = 50)
    private String assignedTo;

    /** Notes written by the technician when resolving the ticket. Nullable. */
    @Column(name = "ResolutionNotes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Ticket() {}

    public Ticket(String id, String resourceId, String location,
                  String category, String priority,
                  String description, String contactPhone,
                  String createdBy) {
        this.id           = id;
        this.resourceId   = resourceId;
        this.location     = location;
        this.category     = category;
        this.priority     = priority;
        this.description  = description;
        this.contactPhone = contactPhone;
        this.createdBy    = createdBy;
        this.status       = "OPEN";
        this.createdAt    = LocalDateTime.now();
        this.updatedAt    = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}