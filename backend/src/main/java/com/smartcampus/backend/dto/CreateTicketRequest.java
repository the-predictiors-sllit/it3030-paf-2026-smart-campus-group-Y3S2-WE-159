package com.smartcampus.backend.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Request body for POST /api/tickets
 *
 * The user fills this in when reporting an incident.
 * 'attachments' contains the generatedFileNames returned by POST /api/upload
 * (the images are already in Minio before this request is sent).
 */
public class CreateTicketRequest {

    /** Optional – ID of a campus resource (room / lab / equipment). */
    private String resourceId;

    /** Free-text location, required when resourceId is not provided. */
    private String location;

    /** Required. HARDWARE | PLUMBING | ELECTRICAL | SOFTWARE | OTHER */
    private String category;

    /** Required. LOW | MEDIUM | HIGH | CRITICAL */
    private String priority;

    /** Required. Min 10 characters, max 2000. */
    private String description;

    /** Optional contact number for follow-up. */
    private String contactPhone;

    /**
     * Optional list of pre-uploaded Minio file names.
     * Maximum 3 items allowed.
     * Example: ["1711025800_usr1001_tint1.jpg"]
     */
    private List<String> attachments = new ArrayList<>();

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
}