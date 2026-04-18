package com.smartcampus.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.service.Auth0UserSyncService;

@RestController
@RequestMapping("/api/admin/auth0")
public class Auth0SyncController {

    private final Auth0UserSyncService syncService;

    public Auth0SyncController(Auth0UserSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> syncUsers() {
        int count = syncService.syncAllUsers();
        return ResponseEntity.ok(Map.of("status", "success", "syncedUsers", count));
    }
}