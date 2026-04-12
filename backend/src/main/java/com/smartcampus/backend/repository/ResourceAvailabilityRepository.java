package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smartcampus.backend.model.ResourceAvailability;

import java.time.LocalTime;
import java.util.List;

//Repository interface for ResourceAvailability entity.
public interface ResourceAvailabilityRepository extends JpaRepository<ResourceAvailability, Integer> {
    
    // Find availability windows for a specific resource
    List<ResourceAvailability> findByResourceId(String resourceId);

    // Find availability windows for a specific resource and day
    List<ResourceAvailability> findByResourceIdAndDayOfWeek(String resourceId, String dayOfWeek);

    // Check if an identical availability window already exists.
    // SQL Server may store these columns as datetime, so cast to time before comparing.
        @Query(value = """
                SELECT COUNT(1)
        FROM ResourceAvailability ra
        WHERE ra.ResourceId = :resourceId
          AND ra.DayOfWeek = :dayOfWeek
                    AND CAST(ra.StartTime AS time) = CAST(:startTime AS time)
                    AND CAST(ra.EndTime AS time) = CAST(:endTime AS time)
        """, nativeQuery = true)
        long countMatchingWindow(
        @Param("resourceId") String resourceId,
        @Param("dayOfWeek") String dayOfWeek,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );
    
    
    // Delete all availability windows for a specific resource
    void deleteByResourceId(String resourceId);
}
