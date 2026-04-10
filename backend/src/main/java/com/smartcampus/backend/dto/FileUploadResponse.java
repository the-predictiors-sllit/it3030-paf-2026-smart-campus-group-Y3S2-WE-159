package com.smartcampus.backend.dto;

/**
 * Response DTO returned after a successful file upload to Minio.
 * Returned by: POST /api/upload
 *
 * The frontend stores 'generatedFileName' and sends it inside
 * CreateTicketRequest.attachments when the user submits the ticket form.
 */
public class FileUploadResponse {

    /** Unique name stored in Minio. Format: {epoch}_{userId}_{original}.{ext} */
    private String generatedFileName;

    /** The original file name the user selected (for display only). */
    private String originalName;

    /** File size in bytes. */
    private long size;

    /** MIME type – e.g. "image/jpeg". */
    private String mimeType;

    // ── Constructor ───────────────────────────────────────────────────────────

    public FileUploadResponse() {}

    public FileUploadResponse(String generatedFileName, String originalName,
                               long size, String mimeType) {
        this.generatedFileName = generatedFileName;
        this.originalName      = originalName;
        this.size              = size;
        this.mimeType          = mimeType;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getGeneratedFileName() { return generatedFileName; }
    public void setGeneratedFileName(String generatedFileName) { this.generatedFileName = generatedFileName; }

    public String getOriginalName() { return originalName; }
    public void setOriginalName(String originalName) { this.originalName = originalName; }

    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
}