package com.smartcampus.backend.controller;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.dto.ApiLink;
import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.BookingListResponse;
import com.smartcampus.backend.dto.BookingResponse;
import com.smartcampus.backend.dto.CreateBookingRequest;
import com.smartcampus.backend.dto.UpdateBookingStatusRequest;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader(name = "X-User-Id", defaultValue = "usr_1001") String userId) {

        BookingResponse response = bookingService.createBooking(request, userId);

        String selfHref = "/api/bookings/" + response.getId();
        Map<String, ApiLink> links = new LinkedHashMap<>();
        links.put("self", new ApiLink(selfHref));
        links.put("resource", new ApiLink("/api/resources/" + response.getResourceId()));
        links.put("cancel", new ApiLink(selfHref + "/status", "PATCH"));

        return ResponseEntity.created(URI.create(selfHref))
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(response, links));
    }

    @PatchMapping("/{bookingId}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable String bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest request) {

        BookingResponse response = bookingService.updateStatus(bookingId, request);

        Map<String, ApiLink> links = new LinkedHashMap<>();
        links.put("self", new ApiLink("/api/bookings/" + response.getId()));
        links.put("resource", new ApiLink("/api/resources/" + response.getResourceId()));

        return ResponseEntity.ok(ApiResponse.success(response, links));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<BookingListResponse>> listBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String userId) {

        BookingListResponse response = bookingService.listBookings(status, userId);

        Map<String, ApiLink> links = new LinkedHashMap<>();
        StringBuilder href = new StringBuilder("/api/bookings");

        boolean hasQuery = false;
        if (status != null) {
            href.append(hasQuery ? '&' : '?').append("status=").append(status.name());
            hasQuery = true;
        }
        if (userId != null && !userId.isBlank()) {
            href.append(hasQuery ? '&' : '?').append("userId=").append(userId);
        }
        links.put("self", new ApiLink(href.toString()));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(response, links));
    }
}
