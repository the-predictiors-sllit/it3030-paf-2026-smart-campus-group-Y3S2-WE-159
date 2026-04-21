package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smartcampus.backend.model.Booking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Booking entity.
 * Provides database operations using Spring Data JPA.
 */
public interface BookingRepository extends JpaRepository<Booking, String> {
    
    /**
     * Find all bookings by user ID
     */
    List<Booking> findByUserId(String userId);
    
    /**
     * Find all bookings by resource ID
     */
    List<Booking> findByResourceId(String resourceId);
    
    /**
     * Find all bookings by status
     */
    List<Booking> findByStatus(String status);
    
    /**
     * Find bookings by user ID and status
     */
    List<Booking> findByUserIdAndStatus(String userId, String status);
    
    /**
     * Find bookings by resource ID and status
     */
    List<Booking> findByResourceIdAndStatus(String resourceId, String status);
    
    /**
     * Check for overlapping bookings on the same resource
     * Returns bookings that overlap with the given time window
     */
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
        @Param("resourceId") String resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    /**
     * Find all bookings for a specific resource within a date range
     */
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.startTime >= :startDate " +
           "AND b.endTime <= :endDate " +
           "ORDER BY b.startTime ASC")
    List<Booking> findBookingsInRange(
        @Param("resourceId") String resourceId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    //analytics page part below 
    // 1. Most Booked Resources
    @Query("SELECT b.resource.name, COUNT(b) FROM Booking b GROUP BY b.resource.name ORDER BY COUNT(b) DESC")
    List<Object[]> findMostBookedResources();

    // 2. Approval Rate
    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> findStatusDistribution();

    // 3. Trends for last 7 days
    @Query(value = "SELECT DATE(start_time) as day, COUNT(*) as count FROM bookings " +
            "WHERE start_time >= CURRENT_DATE - INTERVAL 7 DAY " +
            "GROUP BY day ORDER BY day", nativeQuery = true)
    List<Object[]> findBookingTrendsLast7Days();

    // 4. Peak Hours (Heatmap logic: starts per hour)
    @Query("SELECT HOUR(b.startTime), COUNT(b) FROM Booking b GROUP BY HOUR(b.startTime) ORDER BY HOUR(b.startTime)")
    List<Object[]> findPeakHours();
}
