package com.smartcampus.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartcampus.backend.dto.BookingListResponse;
import com.smartcampus.backend.dto.BookingResponse;
import com.smartcampus.backend.dto.CreateBookingRequest;
import com.smartcampus.backend.dto.UpdateBookingStatusRequest;
import com.smartcampus.backend.exception.InvalidStatusTransitionException;
import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    private CreateBookingRequest createRequest;

    @BeforeEach
    void setUp() {
        createRequest = new CreateBookingRequest();
        createRequest.setResourceId("res_2001");
        createRequest.setStartTime(Instant.parse("2026-04-10T10:00:00Z"));
        createRequest.setEndTime(Instant.parse("2026-04-10T12:00:00Z"));
        createRequest.setPurpose("Exam");
        createRequest.setExpectedAttendees(120);
    }

    @Test
    void createBooking_shouldDefaultToPending() {
        Booking firstSave = new Booking();
        firstSave.setId(1L);
        firstSave.setResourceId("res_2001");
        firstSave.setUserId("usr_1001");
        firstSave.setStartTime(createRequest.getStartTime());
        firstSave.setEndTime(createRequest.getEndTime());
        firstSave.setStatus(BookingStatus.PENDING);
        firstSave.setPurpose("Exam");
        firstSave.setExpectedAttendees(120);

        Booking secondSave = new Booking();
        secondSave.setId(1L);
        secondSave.setBookingCode("bkg_1");
        secondSave.setResourceId("res_2001");
        secondSave.setUserId("usr_1001");
        secondSave.setStartTime(createRequest.getStartTime());
        secondSave.setEndTime(createRequest.getEndTime());
        secondSave.setStatus(BookingStatus.PENDING);
        secondSave.setPurpose("Exam");
        secondSave.setExpectedAttendees(120);

        when(bookingRepository.save(any(Booking.class))).thenReturn(firstSave, secondSave);

        BookingResponse response = bookingService.createBooking(createRequest, "usr_1001");

        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals("bkg_1", response.getId());
        verify(bookingRepository, times(2)).save(any(Booking.class));
    }

    @Test
    void updateStatus_shouldRejectInvalidTransition() {
        Booking booking = new Booking();
        booking.setBookingCode("bkg_10");
        booking.setStatus(BookingStatus.APPROVED);

        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest();
        request.setStatus(BookingStatus.REJECTED);

        when(bookingRepository.findByBookingCode("bkg_10")).thenReturn(Optional.of(booking));

        assertThrows(InvalidStatusTransitionException.class,
                () -> bookingService.updateStatus("bkg_10", request));
    }

    @Test
    void listBookings_shouldFilterByStatusAndUser() {
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setBookingCode("bkg_1");
        booking.setResourceId("res_2001");
        booking.setUserId("usr_1001");
        booking.setStatus(BookingStatus.PENDING);
        booking.setStartTime(Instant.parse("2026-04-10T10:00:00Z"));
        booking.setEndTime(Instant.parse("2026-04-10T12:00:00Z"));

        when(bookingRepository.findByStatusAndUserId(BookingStatus.PENDING, "usr_1001"))
                .thenReturn(List.of(booking));

        BookingListResponse response = bookingService.listBookings(BookingStatus.PENDING, "usr_1001");

        assertEquals(1, response.getTotal());
        assertEquals("bkg_1", response.getItems().getFirst().getId());
    }
}
