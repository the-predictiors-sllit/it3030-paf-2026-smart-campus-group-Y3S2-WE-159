package com.smartcampus.backend.dto;

/**
 * Request body for POST /api/tickets/{id}/comments
 *
 * Used by any authenticated user (USER, ADMIN, TECHNICIAN)
 * to add a message to the ticket discussion thread.
 */
public class AddCommentRequest {

    /** Required. The comment message. */
    private String text;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}