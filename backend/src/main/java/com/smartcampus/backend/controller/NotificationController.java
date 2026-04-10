package com.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.NotificationDTO;
import com.smartcampus.backend.dto.NotificationResponse;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.service.NotificationService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    // GET /api/notifications - get notifications for the user
    // query params: read = false (optional)

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(Authentication authentication,
            @RequestParam(required = false) Boolean read) {
        String userId = extractUserId(authentication);
        List<NotificationDTO> notifications;

        if (read != null && !read) {
            notifications = notificationService.getUnreadNotifications(userId);
        } else if (read != null && read) {
            notifications = notificationService.getReadNotifications(userId);
        } else {
            notifications = notificationService.getAllNotifications(userId);
        }

        Map<String, Object> selfLink = new HashMap<>();
        selfLink.put("href", "/api/notifications" + (read != null ? "?read=" + read : ""));

        Map<String, Object> markAllReadLink = new HashMap<>();
        markAllReadLink.put("href", "/api/notifications/read-all");
        markAllReadLink.put("method", "PATCH");

        Map<String, Object> links = new HashMap<>();
        links.put("self", selfLink);
        links.put("mark_all_read", markAllReadLink);

        Map<String, Object> data = new HashMap<>();
        data.put("items", notifications.stream().map(this::toNotificationResponse).toList());

        ApiResponse<Map<String, Object>> response = new ApiResponse<>("success", data, links);

        return ResponseEntity.ok()
                .header("Cache-Control", "no-store")
                .body(response);
    }

    // GET api/notifications/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotification(Authentication authentication, @PathVariable String id) {
        var notification = notificationService.getNotificationById(id);
        if (notification.isEmpty()) {
            return errorResponse(HttpStatus.NOT_FOUND, "NOTIFICATION_NOT_FOUND", "Notification not found: " + id);
        }

        Map<String, Object> selfLink = new HashMap<>();
        selfLink.put("href", "/api/notifications/" + id);

        Map<String, Object> links = new HashMap<>();
        links.put("self", selfLink);

        ApiResponse<NotificationResponse> response = new ApiResponse<>("success", toNotificationResponse(notification.get()), links);

        return ResponseEntity.ok().header("Cache-Control", "no-store").body(response);
    }

    // Patch /api/notification/{id}/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markNotificationAsRead(Authentication authentication, @PathVariable String id) {
        var notification = notificationService.getNotificationById(id);

        if (notification.isEmpty()) {
            return errorResponse(HttpStatus.NOT_FOUND, "NOTIFICATION_NOT_FOUND", "Notification not found: " + id);
        }
        notificationService.markNotificationAsRead(id);

        Map<String, Object> selfLink = new HashMap<>();
        selfLink.put("href", "/api/notifications/" + id);

        Map<String, Object> links = new HashMap<>();
        links.put("self", selfLink);

        NotificationDTO dto = notification.get();
        dto.setRead(true);

        ApiResponse<NotificationResponse> response = new ApiResponse<>("success", toNotificationResponse(dto), links);

        return ResponseEntity.ok().header("Cache-Control", "no-store").body(response);
    }

    // Patch / api/notifications/read-all

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        String userId = extractUserId(authentication);
        notificationService.markAllNotificationsAsRead(userId);

        Map<String, Object> selfLink = new HashMap<>();
        selfLink.put("href", "/api/notifications");

        Map<String, Object> links = new HashMap<>();
        links.put("self", selfLink);

        ApiResponse<Void> response = new ApiResponse<>("success", null, links);

        return ResponseEntity.ok().header("Cache-Control", "no-store").body(response);
    }

    // Post /api/notifications (internal use)
    // Create a new notification

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(@RequestBody Notification notificationRequest) {
        try {
            NotificationDTO createdNotification = notificationService.createNotification(notificationRequest);

            Map<String, Object> selfLink = new HashMap<>();
            selfLink.put("href", "/api/notifications/" + createdNotification.getId());

            Map<String, Object> links = new HashMap<>();
            links.put("self", selfLink);

            ApiResponse<NotificationResponse> response = new ApiResponse<>("success", toNotificationResponse(createdNotification), links);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .header("Location", "/api/notifications/" + createdNotification.getId())
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while creating notification");
        }
    }

    // Extract userId from jwt
    private String extractUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaimAsString("sub");
        }
        return null;
    }

    private NotificationResponse toNotificationResponse(NotificationDTO dto) {
        NotificationResponse response = NotificationResponse.builder()
                .id(dto.getId())
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .referenceId(dto.getReferenceId())
                .read(dto.isRead())
                .createdAt(dto.getCreatedAt())
                .build();

        response.setLinks(buildNotificationLinks(dto));
        return response;
    }

    private Map<String, Object> buildNotificationLinks(NotificationDTO dto) {
        Map<String, Object> links = new HashMap<>();

        links.put("self", createLink("/api/notifications/" + dto.getId()));

        if (!dto.isRead()) {
            links.put("mark_read", createLinkWithMethod("/api/notifications/" + dto.getId() + "/read", "PATCH"));
        }

        String referenceHref = resolveReferenceHref(dto);
        if (referenceHref != null) {
            links.put("reference", createLink(referenceHref));
        }

        return links;
    }

    private String resolveReferenceHref(NotificationDTO dto) {
        if (dto.getReferenceId() == null || dto.getReferenceId().isBlank() || dto.getType() == null) {
            return null;
        }

        if (dto.getType().startsWith("BOOKING_")) {
            return "/api/bookings/" + dto.getReferenceId();
        }

        return null;
    }

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

    private <T> ResponseEntity<ApiResponse<T>> errorResponse(HttpStatus status, String code, String message) {
        ApiResponse<T> error = new ApiResponse<>("error", null);
        error.setError(code, message);
        return ResponseEntity.status(status).body(error);
    }

}