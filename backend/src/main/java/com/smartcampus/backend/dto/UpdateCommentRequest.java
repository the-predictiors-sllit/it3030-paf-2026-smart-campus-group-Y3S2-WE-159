package com.smartcampus.backend.dto;

/**
 * Request body for PATCH /api/tickets/{ticketId}/comments/{commentId}
 *
 * Only the original author of the comment can call this endpoint.
 */
public class UpdateCommentRequest {

    /** Required. The updated comment text. */
    private String text;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}