package com.smartcampus.backend.controller;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.InputStream;

@RestController
@RequestMapping("/api/incidents")
public class TestMinio {

    @Autowired
    private MinioClient minioClient;

    @GetMapping("/view/{filename}")
    public ResponseEntity<?> viewImage(@PathVariable String filename) {
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket("incident-reports")
                            .object(filename)
                            .build());

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(new InputStreamResource(stream));

        } catch (Exception e) {
            return ResponseEntity.status(404).body("Image not found: " + e.getMessage());
        }
    }
}


// test url : http://localhost:8080/api/incidents/view/<image with extension>