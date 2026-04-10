package com.smartcampus.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for a single ticket – returned by GET /api/tickets/{id}
 * and POST /api/tickets.
 *
 * Comments are included here (full detail view).
 * For the list view use TicketListItem instead.
 */
public class TicketResponse {

    private String id;
    private String resourceId;
    private String location;
    private String category;
    private String priority;
    private String status;
    private String description;
    private String contactPhone;
    private String createdBy;
    private String assignedTo;
    private String resolutionNotes;
    private List<String> attachments;        // list of generatedFileNames
    private List<CommentInfo> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Nested class for comment summaries ────────────────────────────────────

    public static class CommentInfo {
        private String id;
        private String authorId;
        private String text;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CommentInfo() {}

        public CommentInfo(String id, String authorId, String text,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id        = id;
            this.authorId  = authorId;
            this.text      = text;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getAuthorId() { return authorId; }
        public void setAuthorId(String authorId) { this.authorId = authorId; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    public TicketResponse() {}

    public TicketResponse(String id, String resourceId, String location,
                          String category, String priority, String status,
                          String description, String contactPhone,
                          String createdBy, String assignedTo,
                          String resolutionNotes,
                          List<String> attachments,
                          List<CommentInfo> comments,
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id              = id;
        this.resourceId      = resourceId;
        this.location        = location;
        this.category        = category;
        this.priority        = priority;
        this.status          = status;
        this.description     = description;
        this.contactPhone    = contactPhone;
        this.createdBy       = createdBy;
        this.assignedTo      = assignedTo;
        this.resolutionNotes = resolutionNotes;
        this.attachments     = attachments;
        this.comments        = comments;
        this.createdAt       = createdAt;
        this.updatedAt       = updatedAt;
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

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }

    public List<CommentInfo> getComments() { return comments; }
    public void setComments(List<CommentInfo> comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}