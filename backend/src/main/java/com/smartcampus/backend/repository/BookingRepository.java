package com.smartcampus.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.backend.model.Booking;
import com.smartcampus.backend.model.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatusAndUserId(BookingStatus status, String userId);
}
