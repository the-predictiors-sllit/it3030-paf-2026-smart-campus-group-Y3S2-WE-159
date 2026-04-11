package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.backend.model.ResourceAvailability;

import java.time.LocalTime;
import java.util.List;

//Repository interface for ResourceAvailability entity.
public interface ResourceAvailabilityRepository extends JpaRepository<ResourceAvailability, Integer> {
    
    // Find availability windows for a specific resource
    List<ResourceAvailability> findByResourceId(String resourceId);

    // Find availability windows for a specific resource and day
    List<ResourceAvailability> findByResourceIdAndDayOfWeek(String resourceId, String dayOfWeek);

    // Check if an identical availability window already exists
    boolean existsByResourceIdAndDayOfWeekAndStartTimeAndEndTime(
        String resourceId,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime
    );
    
    
    // Delete all availability windows for a specific resource
    void deleteByResourceId(String resourceId);
}
