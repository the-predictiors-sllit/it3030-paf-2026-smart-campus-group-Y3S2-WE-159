package com.smartcampus.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * TicketComment Entity - A message added to a ticket thread.
 *
 * Ownership rules (enforced in TicketService):
 *  - Any authenticated user can ADD a comment to any ticket.
 *  - Only the original author can EDIT or DELETE their own comment.
 *  - ADMIN can delete any comment.
 *
 * Maps to the "TicketComments" table defined in the database schema.
 */
@Entity
@Table(name = "TicketComments")
public class TicketComment {

    @Id
    @Column(name = "Id", length = 50)
    private String id;

    /** The ticket this comment belongs to. */
    @Column(name = "TicketId", nullable = false, length = 50)
    private String ticketId;

    /** User ID of the person who wrote this comment. */
    @Column(name = "AuthorId", nullable = false, length = 50)
    private String authorId;

    @Column(name = "Text", nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public TicketComment() {}

    public TicketComment(String id, String ticketId, String authorId, String text) {
        this.id        = id;
        this.ticketId  = ticketId;
        this.authorId  = authorId;
        this.text      = text;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}