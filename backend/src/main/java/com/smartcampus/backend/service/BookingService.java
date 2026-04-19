package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.ResourceAvailability;
import com.smartcampus.backend.model.User;
import com.smartcampus.backend.repository.BookingRepository;
import com.smartcampus.backend.repository.ResourceAvailabilityRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service layer for Booking operations.
 * Handles business logic, validation, and data transformation.
 */
@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceAvailabilityRepository resourceAvailabilityRepository;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter ID_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /**
     * Create a new booking request.
     * 
     * @param request The booking creation request containing resource, time, and
     *                user details
     * @param userId  The ID of the user making the request
     * @return BookingResponse with the created booking details
     * @throws IllegalArgumentException if booking data is invalid
     */
    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        // Validation
        validateBookingRequest(request);

        // Ensure the requested slot falls within configured resource availability
        // windows.
        validateAgainstResourceAvailability(request.getResourceId(), request.getStartTime(), request.getEndTime());

        // Check for overlapping bookings
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime());

        if (!overlapping.isEmpty()) {
            throw new BookingConflictException("Resource is already booked for the requested time period");
        }

        // Generate unique booking ID
        String bookingId = generateBookingId(userId);

        // Create new booking entity
        Booking booking = new Booking(
                bookingId,
                request.getResourceId(),
                userId,
                request.getStartTime(),
                request.getEndTime(),
                request.getPurpose(),
                request.getExpectedAttendees());

        // Save to database
        Booking savedBooking = bookingRepository.save(booking);

        // Convert to response DTO
        return convertToBookingResponse(savedBooking);
    }

    /**
     * Get a specific booking by ID.
     * 
     * @param bookingId The booking ID
     * @return BookingResponse if found
     * @throws NoSuchElementException if booking not found
     */
    public BookingResponse getBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found: " + bookingId));
        return convertToBookingResponse(booking);
    }

    /**
     * Update booking status (approve, reject, or cancel).
     * 
     * @param bookingId     The booking ID to update
     * @param statusRequest The new status and optional reason
     * @return BookingResponse with updated booking details
     * @throws NoSuchElementException   if booking not found
     * @throws IllegalArgumentException if status is invalid
     */

    public BookingResponse updateBookingStatus(String bookingId, UpdateBookingStatusRequest statusRequest) {
        String newStatus = statusRequest.getStatus().toUpperCase();

        if (!isValidStatus(newStatus)) {
            throw new IllegalArgumentException("Invalid booking status: " + newStatus);
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found: " + bookingId));

        // Refinement: Enforce mandatory reason for rejections
        if ("REJECTED".equals(newStatus)
                && (statusRequest.getReason() == null || statusRequest.getReason().isBlank())) {
            throw new IllegalArgumentException("A reason must be provided for rejected bookings.");
        }

        // Refinement: Prevent updating already finalized bookings
        if (!"PENDING".equals(booking.getStatus()) && !"CANCELLED".equals(newStatus)) {
            throw new IllegalStateException("Only PENDING bookings can be Approved or Rejected.");
        }

        booking.setStatus(newStatus);
        booking.setReason(statusRequest.getReason());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToBookingResponse(updatedBooking);
    }

    /**
     * List bookings with optional filtering by status and/or user ID.
     * Supports pagination.
     * 
     * @param userId Optional user ID filter
     * @param status Optional status filter (PENDING, APPROVED, REJECTED, CANCELLED)
     * @param page   Page number (0-indexed)
     * @param limit  Number of items per page
     * @return ListBookingsResponse containing paginated bookings
     */
    public ListBookingsResponse listBookings(String userId, String resourceId, String status, int page, int limit) {
        int validatedPage = Math.max(page, 1);
        int validatedLimit = Math.max(limit, 1);
        String normalizedStatus = normalizeStatus(status);

        List<Booking> bookings;

        // Apply filters
        if (resourceId != null && !resourceId.isEmpty() && normalizedStatus != null && !normalizedStatus.isEmpty()) {
            bookings = bookingRepository.findByResourceIdAndStatus(resourceId, normalizedStatus);
            if (userId != null && !userId.isEmpty()) {
                bookings = bookings.stream()
                        .filter(booking -> userId.equals(booking.getUserId()))
                        .collect(Collectors.toList());
            }
        } else if (userId != null && !userId.isEmpty() && normalizedStatus != null && !normalizedStatus.isEmpty()) {
            bookings = bookingRepository.findByUserIdAndStatus(userId, normalizedStatus);
        } else if (resourceId != null && !resourceId.isEmpty() && userId != null && !userId.isEmpty()) {
            bookings = bookingRepository.findByResourceId(resourceId);
            bookings = bookings.stream()
                    .filter(booking -> userId.equals(booking.getUserId()))
                    .collect(Collectors.toList());
        } else if (resourceId != null && !resourceId.isEmpty()) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else if (userId != null && !userId.isEmpty()) {
            bookings = bookingRepository.findByUserId(userId);
        } else if (normalizedStatus != null && !normalizedStatus.isEmpty()) {
            bookings = bookingRepository.findByStatus(normalizedStatus);
        } else {
            bookings = bookingRepository.findAll();
        }

        // Sort by start time descending (most recent first)
        bookings.sort((b1, b2) -> b2.getStartTime().compareTo(b1.getStartTime()));

        // Calculate pagination
        int total = bookings.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / validatedLimit);

        // Apply pagination
        int startIdx = (validatedPage - 1) * validatedLimit;
        int endIdx = Math.min(startIdx + validatedLimit, total);

        List<BookingListItem> paginatedItems = startIdx >= total
                ? Collections.emptyList()
                : bookings.subList(startIdx, endIdx)
                        .stream()
                        .map(this::convertToBookingListItem)
                        .collect(Collectors.toList());

        return new ListBookingsResponse(paginatedItems, total, validatedPage, totalPages);
    }

    /**
     * Delete a booking (for testing/admin purposes).
     * 
     * @param bookingId The booking ID to delete
     */
    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new NoSuchElementException("Booking not found: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }

    /**
     * Check if a time slot is available for a resource.
     * 
     * @param resourceId The resource ID
     * @param startTime  Requested start time
     * @param endTime    Requested end time
     * @return true if available, false if already booked
     */
    public boolean isTimeSlotAvailable(String resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        List<Booking> overlapping = bookingRepository.findOverlappingBookings(resourceId, startTime, endTime);
        return overlapping.isEmpty();
    }

    // ============ Helper Methods ============

    /**
     * Validate booking request data.
     */
    private void validateBookingRequest(CreateBookingRequest request) {
        if (request.getResourceId() == null || request.getResourceId().isEmpty()) {
            throw new IllegalArgumentException("Resource ID is required");
        }

        if (request.getStartTime() == null) {
            throw new IllegalArgumentException("Start time is required");
        }

        if (request.getEndTime() == null) {
            throw new IllegalArgumentException("End time is required");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book for a past time");
        }

        if (request.getPurpose() == null || request.getPurpose().isEmpty()) {
            throw new IllegalArgumentException("Purpose is required");
        }

        if (request.getPurpose().length() > 255) {
            throw new IllegalArgumentException("Purpose must not exceed 255 characters");
        }
    }

    /**
     * Check if status is valid.
     */
    private boolean isValidStatus(String status) {
        return status != null && (status.equals("APPROVED") ||
                status.equals("REJECTED") ||
                status.equals("CANCELLED") ||
                status.equals("PENDING"));
    }

    /**
     * Normalizes an optional status filter and validates known booking status
     * values.
     */
    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (!isValidStatus(normalized)) {
            throw new IllegalArgumentException("Invalid booking status filter: " + status);
        }
        return normalized;
    }

    /**
     * Generate unique booking ID.
     * Format: bkg_{timestamp}_{userId}
     */
    private String generateBookingId(String userId) {
        String timestamp = LocalDateTime.now().format(ID_FORMATTER);
        // Extract numeric part from userId if it contains non-numeric characters
        String userIdNum = userId.replaceAll("[^0-9]", "").substring(0, Math.min(4,
                userId.replaceAll("[^0-9]", "").length()));
        return "bkg_" + timestamp + "_" + userIdNum;
    }

    /**
     * Convert Booking entity to BookingResponse DTO.
     */
    private BookingResponse convertToBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getResourceId(),
                booking.getUserId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus(),
                booking.getReason(),
                booking.getCreatedAt(),
                booking.getUpdatedAt());
    }

    /**
     * Convert Booking entity to BookingListItem DTO with HATEOAS links.
     */
    private BookingListItem convertToBookingListItem(Booking booking) {
        // Fetch user details
        User user = userRepository.findById(booking.getUserId()).orElse(null);
        BookingListItem.UserInfo userInfo = null;
        if (user != null) {
            userInfo = new BookingListItem.UserInfo(user.getId(), user.getName(), user.getEmail());
        }

        BookingListItem item = new BookingListItem(
                booking.getId(),
                new BookingListItem.ResourceInfo(booking.getResourceId(), "Resource " + booking.getResourceId()),
                userInfo,
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus());

        // Add HATEOAS links
        Map<String, String> selfLink = new HashMap<>();
        selfLink.put("href", "/api/bookings/" + booking.getId());
        item.addLink("self", selfLink);

        Map<String, String> resourceLink = new HashMap<>();
        resourceLink.put("href", "/api/resources/" + booking.getResourceId());
        item.addLink("resource", resourceLink);

        Map<String, String> availabilityLink = new HashMap<>();
        availabilityLink.put("href", "/api/resources/" + booking.getResourceId() + "/availability");
        item.addLink("resource_availability", availabilityLink);

        return item;
    }

    private void validateAgainstResourceAvailability(String resourceId, LocalDateTime startTime,
            LocalDateTime endTime) {
        if (!startTime.toLocalDate().equals(endTime.toLocalDate())) {
            throw new BookingConflictException(
                    "Booking must start and end on the same day to match resource availability windows");
        }

        String dayOfWeek = startTime.getDayOfWeek().name();
        List<ResourceAvailability> availabilityWindows = resourceAvailabilityRepository
                .findByResourceIdAndDayOfWeek(resourceId, dayOfWeek);

        if (availabilityWindows.isEmpty()) {
            throw new BookingConflictException("Resource is not available on " + dayOfWeek);
        }

        LocalTime requestedStart = startTime.toLocalTime();
        LocalTime requestedEnd = endTime.toLocalTime();

        boolean fitsWindow = availabilityWindows.stream()
                .anyMatch(window -> !requestedStart.isBefore(window.getStartTime()) &&
                        !requestedEnd.isAfter(window.getEndTime()));

        if (!fitsWindow) {
            throw new BookingConflictException("Requested time is outside configured resource availability windows");
        }
    }
}
