package com.smartcampus.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;

@DataJpaTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:bookingrepo;DB_CLOSE_DELAY=-1;MODE=LEGACY",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void shouldFindByStatus() {
        Booking pending = createBooking("bkg_1", "usr_1001", BookingStatus.PENDING);
        Booking approved = createBooking("bkg_2", "usr_1002", BookingStatus.APPROVED);
        bookingRepository.saveAll(List.of(pending, approved));

        List<Booking> result = bookingRepository.findByStatus(BookingStatus.PENDING);

        assertEquals(1, result.size());
        assertEquals("bkg_1", result.getFirst().getBookingCode());
    }

    @Test
    void shouldFindByUserId() {
        Booking a = createBooking("bkg_3", "usr_1001", BookingStatus.PENDING);
        Booking b = createBooking("bkg_4", "usr_1002", BookingStatus.PENDING);
        bookingRepository.saveAll(List.of(a, b));

        List<Booking> result = bookingRepository.findByUserId("usr_1001");

        assertEquals(1, result.size());
        assertEquals("bkg_3", result.getFirst().getBookingCode());
    }

    @Test
    void shouldFindByStatusAndUserId() {
        Booking a = createBooking("bkg_5", "usr_1001", BookingStatus.PENDING);
        Booking b = createBooking("bkg_6", "usr_1001", BookingStatus.APPROVED);
        bookingRepository.saveAll(List.of(a, b));

        List<Booking> result = bookingRepository.findByStatusAndUserId(BookingStatus.PENDING, "usr_1001");

        assertEquals(1, result.size());
        assertEquals("bkg_5", result.getFirst().getBookingCode());
    }

    private Booking createBooking(String code, String userId, BookingStatus status) {
        Booking booking = new Booking();
        booking.setBookingCode(code);
        booking.setResourceId("res_2001");
        booking.setUserId(userId);
        booking.setStartTime(Instant.parse("2026-04-10T10:00:00Z"));
        booking.setEndTime(Instant.parse("2026-04-10T12:00:00Z"));
        booking.setStatus(status);
        booking.setPurpose("Exam");
        booking.setExpectedAttendees(100);
        return booking;
    }
}
