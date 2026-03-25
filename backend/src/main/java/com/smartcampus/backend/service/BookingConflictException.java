package com.smartcampus.backend.service;

/**
 * Raised when a booking cannot be created because of time overlap conflicts.
 */
public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
