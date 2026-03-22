package com.smartcampus.backend.service;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.smartcampus.backend.dto.BookingListResponse;
import com.smartcampus.backend.dto.BookingResponse;
import com.smartcampus.backend.dto.CreateBookingRequest;
import com.smartcampus.backend.dto.UpdateBookingStatusRequest;
import com.smartcampus.backend.exception.InvalidStatusTransitionException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.repository.BookingRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        if (request.getEndTime().isBefore(request.getStartTime()) || request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("endTime must be after startTime");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setUserId(userId);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        if (saved.getBookingCode() == null || saved.getBookingCode().isBlank()) {
            saved.setBookingCode("bkg_" + saved.getId());
            saved = bookingRepository.save(saved);
        }

        return mapToBookingResponse(saved);
    }

    public BookingResponse updateStatus(String bookingCode, UpdateBookingStatusRequest request) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingCode));

        validateStatusTransition(booking.getStatus(), request.getStatus());

        booking.setStatus(request.getStatus());
        booking.setReason(request.getReason());

        Booking updated = bookingRepository.save(booking);
        return mapToBookingResponse(updated);
    }

    public BookingListResponse listBookings(BookingStatus status, String userId) {
        List<Booking> bookings;
        if (status != null && userId != null && !userId.isBlank()) {
            bookings = bookingRepository.findByStatusAndUserId(status, userId);
        } else if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else if (userId != null && !userId.isBlank()) {
            bookings = bookingRepository.findByUserId(userId);
        } else {
            bookings = bookingRepository.findAll();
        }

        BookingListResponse response = new BookingListResponse();
        List<BookingListResponse.Item> items = new ArrayList<>();

        for (Booking booking : bookings) {
            BookingListResponse.Item item = new BookingListResponse.Item();
            item.setId(resolveBookingId(booking));

            BookingListResponse.ResourceSummary resource = new BookingListResponse.ResourceSummary();
            resource.setId(booking.getResourceId());
            resource.setName(null);
            item.setResource(resource);

            item.setStartTime(booking.getStartTime());
            item.setEndTime(booking.getEndTime());
            item.setStatus(booking.getStatus());
            items.add(item);
        }

        response.setItems(items);
        response.setTotal(items.size());
        return response;
    }

    private void validateStatusTransition(BookingStatus from, BookingStatus to) {
        if (from == to) {
            return;
        }

        Set<BookingStatus> allowed;
        if (from == BookingStatus.PENDING) {
            allowed = EnumSet.of(BookingStatus.APPROVED, BookingStatus.REJECTED, BookingStatus.CANCELLED);
        } else if (from == BookingStatus.APPROVED) {
            allowed = EnumSet.of(BookingStatus.CANCELLED);
        } else {
            allowed = EnumSet.noneOf(BookingStatus.class);
        }

        if (!allowed.contains(to)) {
            throw new InvalidStatusTransitionException("Invalid status transition: " + from + " -> " + to);
        }
    }

    public BookingResponse mapToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(resolveBookingId(booking));
        response.setResourceId(booking.getResourceId());
        response.setUserId(booking.getUserId());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setStatus(booking.getStatus());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setReason(booking.getReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }

    private String resolveBookingId(Booking booking) {
        if (booking.getBookingCode() != null && !booking.getBookingCode().isBlank()) {
            return booking.getBookingCode();
        }
        return "bkg_" + booking.getId();
    }
}
