package com.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.smartcampus.backend.repository.BookingRepository;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/bookings/summary")
    public ResponseEntity<Map<String, Object>> getBookingSummary(Authentication authentication) {
        Map<String, Object> data = new HashMap<>();
        data.put("resources", bookingRepository.findMostBookedResources());
        data.put("statusDistribution", bookingRepository.findStatusDistribution());
        data.put("trends", bookingRepository.findBookingTrendsLast7Days());
        data.put("peakHours", bookingRepository.findPeakHours());
        return ResponseEntity.ok(data);
    }
}