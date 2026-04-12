package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.config.SecurityContextUtil;
import com.smartcampus.backend.service.BookingConflictException;
import com.smartcampus.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller for Booking Management API.
 * Implements Module B endpoints:
 * - POST /api/bookings - Create booking
 * - GET /api/bookings - List bookings with filtering
 * - GET /api/bookings/me - List current user's bookings (derived from JWT)
 * - GET /api/bookings/{id} - Get booking details
 * - PATCH /api/bookings/{id}/status - Update booking status
 * 
 * Follows REST architectural constraints with HATEOAS links and proper HTTP semantics.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * POST /api/bookings
     * Create a new booking request.
     * 
     * Status Codes:
     * - 201 Created: Booking successfully created
     * - 400 Bad Request: Invalid input data
     * - 409 Conflict: Resource already booked for requested time
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
        @RequestBody CreateBookingRequest request,
        Authentication authentication) {
        
        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Missing or invalid bearer token: user id (sub) claim not found"
                );
            }
            
            BookingResponse booking = bookingService.createBooking(request, userId);
            
            // Build response with HATEOAS links
            ApiResponse<BookingResponse> response = new ApiResponse<>("success", booking);
            response.addLink("self", createLink("/api/bookings/" + booking.getId()));
            response.addLink("resource", createLink("/api/resources/" + booking.getResourceId()));
            response.addLink("resource_availability", createLink("/api/resources/" + booking.getResourceId() + "/availability"));
            response.addLink("cancel", createLinkWithMethod("/api/bookings/" + booking.getId(), "DELETE"));
            
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Location", "/api/bookings/" + booking.getId())
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, "BOOKING_VALIDATION_ERROR", e.getMessage());
        } catch (BookingConflictException e) {
            return errorResponse(HttpStatus.CONFLICT, "BOOKING_CONFLICT", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while creating booking");
        }
    }
    
    /**
     * GET /api/bookings
     * List bookings with optional filtering and pagination.
     * 
     * Query Parameters:
     * - status: Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
     * - userId: Filter by user ID
     * - page: Page number (0-indexed), default 0
     * - limit: Items per page, default 10
     * 
     * Status Codes:
     * - 200 OK: Successfully retrieved bookings
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ListBookingsResponse>> listBookings(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "resourceId", required = false) String resourceId,
        @RequestParam(value = "userId", required = false) String userId,
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            ListBookingsResponse bookings = bookingService.listBookings(userId, resourceId, status, page, limit);
            
            // Build response with HATEOAS links
            ApiResponse<ListBookingsResponse> response = new ApiResponse<>("success", bookings);
            
            // Self link
            String queryString = buildQueryString(status, resourceId, userId, bookings.getPage(), limit);
            response.addLink("self", createLink("/api/bookings" + queryString));
            
            // Next link (if not on last page)
            if (bookings.getTotalPages() > 0 && bookings.getPage() < bookings.getTotalPages()) {
                String nextQuery = buildQueryString(status, resourceId, userId, bookings.getPage() + 1, limit);
                response.addLink("next", createLink("/api/bookings" + nextQuery));
            }
            
            // Previous link (if not on first page)
            if (bookings.getPage() > 1) {
                String prevQuery = buildQueryString(status, resourceId, userId, bookings.getPage() - 1, limit);
                response.addLink("prev", createLink("/api/bookings" + prevQuery));
            }
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, "BOOKING_QUERY_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while listing bookings");
        }
    }

    /**
     * GET /api/bookings/me
     * List bookings for the currently authenticated user.
     *
     * The user ID is always extracted from the JWT `sub` claim,
     * so clients cannot access other users' bookings via query parameters.
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ListBookingsResponse>> listMyBookings(
        @RequestParam(value = "status", required = false) String status,
        @RequestParam(value = "resourceId", required = false) String resourceId,
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "limit", defaultValue = "10") int limit,
        Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Missing or invalid bearer token: user id (sub) claim not found"
                );
            }

            ListBookingsResponse bookings = bookingService.listBookings(userId, resourceId, status, page, limit);

            ApiResponse<ListBookingsResponse> response = new ApiResponse<>("success", bookings);

            String queryString = buildMyBookingsQueryString(status, resourceId, bookings.getPage(), limit);
            response.addLink("self", createLink("/api/bookings/me" + queryString));

            if (bookings.getTotalPages() > 0 && bookings.getPage() < bookings.getTotalPages()) {
                String nextQuery = buildMyBookingsQueryString(status, resourceId, bookings.getPage() + 1, limit);
                response.addLink("next", createLink("/api/bookings/me" + nextQuery));
            }

            if (bookings.getPage() > 1) {
                String prevQuery = buildMyBookingsQueryString(status, resourceId, bookings.getPage() - 1, limit);
                response.addLink("prev", createLink("/api/bookings/me" + prevQuery));
            }

            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);

        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, "BOOKING_QUERY_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while listing user bookings");
        }
    }
    
    /**
     * GET /api/bookings/{id}
     * Get details of a specific booking.
     * 
     * Status Codes:
     * - 200 OK: Booking found
     * - 404 Not Found: Booking not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable String id, Authentication authentication) {
        try {
            BookingResponse booking = bookingService.getBooking(id);

            String userId = SecurityContextUtil.getUserId(authentication);
            boolean isAdmin = SecurityContextUtil.hasRole(authentication, "ADMIN");
            if (!isAdmin && (userId == null || !userId.equals(booking.getUserId()))) {
                return errorResponse(HttpStatus.FORBIDDEN, "FORBIDDEN", "You can only access your own bookings");
            }
            
            // Build response with HATEOAS links
            ApiResponse<BookingResponse> response = new ApiResponse<>("success", booking);
            response.addLink("self", createLink("/api/bookings/" + booking.getId()));
            response.addLink("resource", createLink("/api/resources/" + booking.getResourceId()));
            response.addLink("resource_availability", createLink("/api/resources/" + booking.getResourceId() + "/availability"));
            response.addLink("cancel", createLinkWithMethod("/api/bookings/" + booking.getId(), "DELETE"));
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while fetching booking");
        }
    }
    
    /**
     * PATCH /api/bookings/{id}/status
     * Update booking status (approve, reject, or cancel).
     * 
     * Request Body:
     * {
     *   "status": "APPROVED|REJECTED|CANCELLED",
     *   "reason": "Optional reason/comment"
     * }
     * 
     * Status Codes:
     * - 200 OK: Status updated successfully
     * - 400 Bad Request: Invalid status
     * - 404 Not Found: Booking not found
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
        @PathVariable String id,
        @RequestBody UpdateBookingStatusRequest statusRequest) {
        
        try {
            BookingResponse booking = bookingService.updateBookingStatus(id, statusRequest);
            
            // Build response with HATEOAS links
            ApiResponse<BookingResponse> response = new ApiResponse<>("success", booking);
            response.addLink("self", createLink("/api/bookings/" + booking.getId()));
            response.addLink("resource", createLink("/api/resources/" + booking.getResourceId()));
            response.addLink("resource_availability", createLink("/api/resources/" + booking.getResourceId() + "/availability"));
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", e.getMessage());
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST, "BOOKING_VALIDATION_ERROR", e.getMessage());
        } catch (BookingConflictException e) {
            return errorResponse(HttpStatus.CONFLICT, "BOOKING_CONFLICT", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Unexpected error occurred while updating booking status");
        }
    }
    
    /**
     * DELETE /api/bookings/{id}
     * Delete a booking (for testing/admin purposes).
     * 
     * Status Codes:
     * - 204 No Content: Successfully deleted
     * - 404 Not Found: Booking not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ============ Helper Methods ============
    
    /**
     * Helper to create HATEOAS link map.
     */
    private Map<String, String> createLink(String href) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        return link;
    }
    
    /**
     * Helper to create HATEOAS link with HTTP method.
     */
    private Map<String, String> createLinkWithMethod(String href, String method) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        link.put("method", method);
        return link;
    }
    
    /**
     * Helper to build query string for pagination.
     */
    private String buildQueryString(String status, String resourceId, String userId, int page, int limit) {
        StringBuilder sb = new StringBuilder("?");
        boolean first = true;
        
        if (status != null && !status.isEmpty()) {
            sb.append("status=").append(status);
            first = false;
        }

        if (resourceId != null && !resourceId.isEmpty()) {
            if (!first) sb.append("&");
            sb.append("resourceId=").append(resourceId);
            first = false;
        }
        
        if (userId != null && !userId.isEmpty()) {
            if (!first) sb.append("&");
            sb.append("userId=").append(userId);
            first = false;
        }
        
        if (!first) sb.append("&");
        sb.append("page=").append(page).append("&limit=").append(limit);
        
        return sb.toString();
    }

    /**
     * Build query string for /api/bookings/me links.
     */
    private String buildMyBookingsQueryString(String status, String resourceId, int page, int limit) {
        return buildQueryString(status, resourceId, null, page, limit);
    }

    private <T> ResponseEntity<ApiResponse<T>> errorResponse(HttpStatus status, String code, String message) {
        ApiResponse<T> error = new ApiResponse<>("error", null);
        error.setError(code, message);
        return ResponseEntity.status(status).body(error);
    }
}
