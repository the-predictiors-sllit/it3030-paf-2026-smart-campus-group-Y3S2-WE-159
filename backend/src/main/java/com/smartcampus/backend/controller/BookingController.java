package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.service.BookingConflictException;
import com.smartcampus.backend.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller for Booking Management API.
 * Implements Module B endpoints:
 * - POST /api/bookings - Create booking
 * - GET /api/bookings - List bookings with filtering
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
        @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        try {
            // For now, use a default user ID (when auth is added, extract from JWT token)
            if (userId == null || userId.isEmpty()) {
                userId = "usr_1001"; // Default user for testing
            }
            
            BookingResponse booking = bookingService.createBooking(request, userId);
            
            // Build response with HATEOAS links
            ApiResponse<BookingResponse> response = new ApiResponse<>("success", booking);
            response.addLink("self", createLink("/api/bookings/" + booking.getId()));
            response.addLink("resource", createLink("/api/resources/" + booking.getResourceId()));
            response.addLink("cancel", createLinkWithMethod("/api/bookings/" + booking.getId(), "DELETE"));
            
            return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Location", "/api/bookings/" + booking.getId())
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (IllegalArgumentException e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
        @RequestParam(value = "userId", required = false) String userId,
        @RequestParam(value = "page", defaultValue = "1") int page,
        @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        try {
            ListBookingsResponse bookings = bookingService.listBookings(userId, status, page, limit);
            
            // Build response with HATEOAS links
            ApiResponse<ListBookingsResponse> response = new ApiResponse<>("success", bookings);
            
            // Self link
            String queryString = buildQueryString(status, userId, bookings.getPage(), limit);
            response.addLink("self", createLink("/api/bookings" + queryString));
            
            // Next link (if not on last page)
            if (bookings.getTotalPages() > 0 && bookings.getPage() < bookings.getTotalPages()) {
                String nextQuery = buildQueryString(status, userId, bookings.getPage() + 1, limit);
                response.addLink("next", createLink("/api/bookings" + nextQuery));
            }
            
            // Previous link (if not on first page)
            if (bookings.getPage() > 1) {
                String prevQuery = buildQueryString(status, userId, bookings.getPage() - 1, limit);
                response.addLink("prev", createLink("/api/bookings" + prevQuery));
            }
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (IllegalArgumentException e) {
            ApiResponse<ListBookingsResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            ApiResponse<ListBookingsResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable String id) {
        try {
            BookingResponse booking = bookingService.getBooking(id);
            
            // Build response with HATEOAS links
            ApiResponse<BookingResponse> response = new ApiResponse<>("success", booking);
            response.addLink("self", createLink("/api/bookings/" + booking.getId()));
            response.addLink("resource", createLink("/api/resources/" + booking.getResourceId()));
            response.addLink("cancel", createLinkWithMethod("/api/bookings/" + booking.getId(), "DELETE"));
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (NoSuchElementException e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
            
            return ResponseEntity
                .ok()
                .header("Cache-Control", "no-store")
                .body(response);
                
        } catch (NoSuchElementException e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (IllegalArgumentException e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (BookingConflictException e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        } catch (Exception e) {
            ApiResponse<BookingResponse> error = new ApiResponse<>("error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
    private String buildQueryString(String status, String userId, int page, int limit) {
        StringBuilder sb = new StringBuilder("?");
        boolean first = true;
        
        if (status != null && !status.isEmpty()) {
            sb.append("status=").append(status);
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
}
