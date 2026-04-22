package com.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.BookingRepository;

@RestController
@RequestMapping("/api/analytics/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceAnalyticsController {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * GET /api/analytics/resources
     * Returns comprehensive resource analytics for admin dashboard
     * Includes: total count, distribution by type/status, most booked resources, utilization
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getResourceAnalytics(Authentication authentication) {
        Map<String, Object> analytics = new HashMap<>();

        try {
            // 1. Total resources count
            long totalResources = resourceRepository.countTotal();
            analytics.put("totalResources", totalResources);

            // 2. Resources distribution by type
            Map<String, Long> typeDistribution = resourceRepository.countByType()
                    .stream()
                    .collect(Collectors.toMap(
                            result -> (String) result[0],
                            result -> ((Number) result[1]).longValue()
                    ));
            analytics.put("typeDistribution", typeDistribution);

            // 3. Resources distribution by status
            Map<String, Long> statusDistribution = resourceRepository.countByStatus()
                    .stream()
                    .collect(Collectors.toMap(
                            result -> (String) result[0],
                            result -> ((Number) result[1]).longValue()
                    ));
            analytics.put("statusDistribution", statusDistribution);

            // 4. Most booked resources (using existing booking analytics)
            List<Object[]> mostBookedResources = bookingRepository.findMostBookedResources();
            List<Map<String, Object>> mostBooked = mostBookedResources.stream()
                    .map(result -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("name", result[0]);
                        item.put("bookingCount", ((Number) result[1]).longValue());
                        return item;
                    })
                    .limit(5)
                    .collect(Collectors.toList());
            analytics.put("mostBookedResources", mostBooked);

            // 5. Recently added resources
            List<Map<String, Object>> recentlyAdded = resourceRepository.findRecentlyAdded()
                    .stream()
                    .map(resource -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("id", resource.getId());
                        item.put("name", resource.getName());
                        item.put("type", resource.getType());
                        item.put("status", resource.getStatus());
                        item.put("createdAt", resource.getCreatedAt());
                        return item;
                    })
                    .collect(Collectors.toList());
            analytics.put("recentlyAdded", recentlyAdded);

            // 6. Average capacity per resource type
            Map<String, Double> avgCapacityByType = new HashMap<>();
            List<Map<String, Object>> typeCapacityData = resourceRepository.findAll()
                    .stream()
                    .filter(r -> r.getCapacity() != null && r.getCapacity() > 0)
                    .collect(Collectors.groupingBy(
                            r -> r.getType(),
                            Collectors.averagingInt(r -> r.getCapacity())
                    ))
                    .entrySet()
                    .stream()
                    .map(entry -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("type", entry.getKey());
                        item.put("avgCapacity", Math.round(entry.getValue() * 100.0) / 100.0);
                        return item;
                    })
                    .collect(Collectors.toList());
            analytics.put("avgCapacityByType", typeCapacityData);

            // 7. Active vs Inactive resources
            Map<String, Long> activeStatus = statusDistribution;
            analytics.put("activeResources", activeStatus.getOrDefault("ACTIVE", 0L));
            analytics.put("inactiveResources", activeStatus.getOrDefault("OUT_OF_SERVICE", 0L));

            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
