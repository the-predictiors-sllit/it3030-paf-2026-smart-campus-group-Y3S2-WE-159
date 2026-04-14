package com.smartcampus.backend.dto;

import java.time.LocalDateTime;

/**
 * Response DTO returned after adding or updating a comment.
 * Returned by: POST and PATCH /api/tickets/{id}/comments/{commentId}
 */
public class TicketCommentResponse {

    private String id;
    private String ticketId;
    private String authorId;
    private String authorName;
    private String text;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Constructor ───────────────────────────────────────────────────────────

    public TicketCommentResponse() {}

    public TicketCommentResponse(String id, String ticketId, String authorId,
                                  String authorName, String text, LocalDateTime createdAt,
                                  LocalDateTime updatedAt) {
        this.id         = id;
        this.ticketId   = ticketId;
        this.authorId   = authorId;
        this.authorName = authorName;
        this.text       = text;
        this.createdAt  = createdAt;
        this.updatedAt  = updatedAt;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}