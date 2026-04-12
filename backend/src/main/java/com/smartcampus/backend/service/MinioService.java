package com.smartcampus.backend.service;

import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * MinioService - Handles all file storage operations with Minio.
 *
 * This service is REUSABLE. Any other feature that needs file uploads
 * (e.g. resource photos in Module A) should inject and use this same service.
 *
 * Key responsibility: generateUniqueFileName()
 * Format: {epochSeconds}_{userId}_{originalName}.{ext}
 * Example: 1711025800_usr1001_photo.jpg
 *
 * The generated name is what gets stored in Minio and in the database.
 * The original file name is never used as the storage key.
 */
@Service
public class MinioService {

    public enum StorageFolder {
        TICKET("tickets"),
        RESOURCE("resources");

        private final String prefix;

        StorageFolder(String prefix) {
            this.prefix = prefix;
        }

        public String prefix() {
            return prefix;
        }
    }

    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    // ── Constructor injection (MinioClient bean comes from MinioConfig) ────────

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Generates a unique file name for storage in Minio.
     *
     * REUSABLE – call this method from any service that needs to store a file.
     *
     * Format : {epochSeconds}_{userId}_{sanitisedOriginalName}.{extension}
     * Example: 1711025800_usr1001_tint1.jpg
     *
     * @param userId       The ID of the currently authenticated user.
     * @param originalName The original file name from the upload (e.g. "my photo.jpg").
     * @return A unique file name safe for use as a Minio object key.
     */
    public String generateUniqueFileName(String userId, String originalName) {
        long epochSeconds = System.currentTimeMillis() / 1000;

        // Sanitise the original name: remove spaces and unsafe characters.
        String sanitised = originalName
                .toLowerCase()
                .replaceAll("\\s+", "_")           // spaces → underscore
                .replaceAll("[^a-z0-9._\\-]", ""); // remove anything not alphanumeric/dot/dash

        // Guard: if sanitisation emptied the name, use a fallback.
        if (sanitised.isEmpty()) {
            sanitised = "file";
        }

        // Extract numeric part from userId for a shorter suffix.
        // e.g. "usr_1001" → "1001"
        String userSuffix = userId.replaceAll("[^0-9]", "");
        if (userSuffix.isEmpty()) {
            userSuffix = userId; // fallback: use the full userId as-is
        }

        return epochSeconds + "_" + userSuffix + "_" + sanitised;
    }

    /**
     * Uploads a file to Minio and returns the generated file name.
     *
     * Steps:
     * 1. Generate a unique name via generateUniqueFileName().
     * 2. Ensure the bucket exists (creates it if missing).
     * 3. Upload the file bytes to Minio under that name.
     *
     * @param userId   The ID of the currently authenticated user.
     * @param file     The multipart file received from the HTTP request.
     * @return The generated file name (store this in the database).
     * @throws RuntimeException if the upload fails.
     */
    public String uploadFile(String userId, MultipartFile file) {
        return uploadFile(userId, file, StorageFolder.TICKET);
    }

    public String uploadFile(String userId, MultipartFile file, StorageFolder folder) {
        try {
            String generatedFileName = generateUniqueFileName(userId, file.getOriginalFilename());
            String objectKey = buildObjectKey(folder, generatedFileName);

            // Make sure the bucket exists before uploading.
            ensureBucketExists();

            // Upload to Minio.
            try (InputStream inputStream = file.getInputStream()) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectKey)
                                .stream(inputStream, file.getSize(), -1)
                                .contentType(file.getContentType())
                                .build()
                );
            }

            return objectKey;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to Minio: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a file from Minio by its generated file name.
     *
     * Called when:
     * - User removes an attachment from the UI before submitting the ticket.
     * - An uploaded file needs to be cleaned up due to a failed ticket creation.
     *
     * @param generatedFileName The unique name returned by uploadFile().
     * @throws RuntimeException if the deletion fails.
     */
    public void deleteFile(String generatedFileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(generatedFileName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file from Minio: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String generatedFileName, StorageFolder folder) {
        deleteFile(buildObjectKey(folder, generatedFileName));
    }

    /**
     * Checks whether a file exists in Minio.
     * Used to validate that an attachment name the user sent actually exists
     * in Minio before linking it to a ticket.
     *
     * @param generatedFileName The file name to check.
     * @return true if the file exists, false otherwise.
     */
    public boolean fileExists(String generatedFileName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(generatedFileName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean fileExists(String generatedFileName, StorageFolder folder) {
        return fileExists(buildObjectKey(folder, generatedFileName));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Creates the Minio bucket if it does not already exist.
     * Called once before each upload to guard against missing buckets.
     */
    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
        );
        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
            );
        }
    }

    private String buildObjectKey(StorageFolder folder, String generatedFileName) {
        String cleanFileName = generatedFileName;
        if (cleanFileName.startsWith("/")) {
            cleanFileName = cleanFileName.substring(1);
        }

        if (cleanFileName.startsWith("tickets/") || cleanFileName.startsWith("resources/")) {
            return cleanFileName;
        }

        StorageFolder target = folder == null ? StorageFolder.TICKET : folder;
        return target.prefix() + "/" + cleanFileName;
    }
}