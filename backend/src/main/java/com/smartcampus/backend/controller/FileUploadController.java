package com.smartcampus.backend.controller;

import com.smartcampus.backend.config.SecurityContextUtil;
import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.FileUploadResponse;
import com.smartcampus.backend.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.util.UriUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * REST Controller for File & Media Management (Module F).
 *
 * Endpoints:
 *   POST   /api/upload            – Upload an image to Minio, get back a generated file name.
 *   DELETE /api/upload/{fileName} – Remove an orphan file from Minio before ticket submission.
 *
 * The upload endpoint is called BEFORE the ticket is created.
 * The frontend collects the returned generatedFileNames and sends them
 * inside CreateTicketRequest.attachments when submitting the ticket form.
 *
 * Allowed file types: JPEG, PNG, GIF, WEBP (images only – per assignment spec).
 * Max file size: 10 MB (configured in application.properties).
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    @Autowired
    private MinioService minioService;

    // Allowed MIME types – images only
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    // 10 MB in bytes (matches spring.servlet.multipart.max-file-size)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // ── POST /api/upload ──────────────────────────────────────────────────────

    /**
     * Uploads a file to Minio and returns the generated unique file name.
     *
     * The generated name format is: {epochSeconds}_{userId}_{originalName}.{ext}
     * Example: 1711025800_usr1001_tint1.jpg
     *
     * Status Codes:
     *   201 Created     – File uploaded successfully.
     *   400 Bad Request – No file, wrong type, or file too large.
     *   500 Internal    – Minio error.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false, defaultValue = "ticket") String folder,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(HttpStatus.UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "Missing or invalid bearer token: user id (sub) claim not found");
            }

            MinioService.StorageFolder storageFolder = resolveStorageFolder(folder);

            // ── Validation ────────────────────────────────────────────────────

            if (file == null || file.isEmpty()) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "FILE_REQUIRED", "No file was provided in the request");
            }

            String mimeType = file.getContentType();
            if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "INVALID_FILE_TYPE",
                        "Only image files are allowed (JPEG, PNG, GIF, WEBP). " +
                        "Received: " + mimeType);
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "FILE_TOO_LARGE",
                        "File size must not exceed 10 MB. " +
                        "Received: " + (file.getSize() / (1024 * 1024)) + " MB");
            }

            // ── Upload to Minio ───────────────────────────────────────────────

            String generatedFileName = minioService.uploadFile(userId, file, storageFolder);

            FileUploadResponse uploadResponse = new FileUploadResponse(
                    generatedFileName,
                    file.getOriginalFilename(),
                    file.getSize(),
                    mimeType
            );

            // Build API response with HATEOAS links
            ApiResponse<FileUploadResponse> response =
                    new ApiResponse<>("success", uploadResponse);
                String encodedFileName = UriUtils.encode(generatedFileName, java.nio.charset.StandardCharsets.UTF_8);
                response.addLink("self", createLink("/api/upload?fileName=" + encodedFileName));
                response.addLink("delete", createLinkWithMethod("/api/upload?fileName=" + encodedFileName, "DELETE"));

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/upload?fileName=" + encodedFileName)
                    .body(response);

        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "UPLOAD_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "UPLOAD_FAILED", "Failed to upload file: " + e.getMessage());
        }
    }

    @DeleteMapping(params = "fileName")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFileByQuery(
            @RequestParam("fileName") String fileName) {
        return deleteFileInternal(fileName);
    }

    // ── DELETE /api/upload/{fileName} ─────────────────────────────────────────

    /**
     * Deletes an uploaded file from Minio before it is linked to a ticket.
     *
     * Called when the user removes an image from their ticket form
     * before submitting – cleans up the orphan file in Minio.
     *
     * Status Codes:
     *   200 OK          – File deleted from Minio.
     *   400 Bad Request – Invalid file name.
     *   500 Internal    – Minio error.
     */
    @DeleteMapping("/{fileName}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFile(
            @PathVariable String fileName) {

        return deleteFileInternal(fileName);
    }

    private ResponseEntity<ApiResponse<Map<String, String>>> deleteFileInternal(String fileName) {

        try {
            if (fileName == null || fileName.isBlank()) {
                return errorResponse(HttpStatus.BAD_REQUEST,
                        "INVALID_FILE_NAME", "File name cannot be empty");
            }

            minioService.deleteFile(fileName);

            Map<String, String> message = new HashMap<>();
            message.put("message", "File deleted successfully from Minio.");

            ApiResponse<Map<String, String>> response =
                    new ApiResponse<>("success", message);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "DELETE_FAILED", "Failed to delete file: " + e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, String> createLink(String href) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        return link;
    }

    private Map<String, String> createLinkWithMethod(String href, String method) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        link.put("method", method);
        return link;
    }

    private <T> ResponseEntity<ApiResponse<T>> errorResponse(
            HttpStatus status, String code, String message) {
        ApiResponse<T> error = new ApiResponse<>("error", null);
        error.setError(code, message);
        return ResponseEntity.status(status).body(error);
    }

    private MinioService.StorageFolder resolveStorageFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            return MinioService.StorageFolder.TICKET;
        }

        if ("resource".equalsIgnoreCase(folder)) {
            return MinioService.StorageFolder.RESOURCE;
        }
        if ("ticket".equalsIgnoreCase(folder)) {
            return MinioService.StorageFolder.TICKET;
        }

        throw new IllegalArgumentException("Invalid folder. Use 'ticket' or 'resource'");
    }
}