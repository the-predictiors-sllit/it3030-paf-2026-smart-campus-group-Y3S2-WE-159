package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.backend.model.ResourceAvailability;

import java.util.List;

/*Repository interface for ResourceAvailability entity.*/
public interface ResourceAvailabilityRepository extends JpaRepository<ResourceAvailability, Integer> {
    
    /* Find availability windows for a specific resource*/
    List<ResourceAvailability> findByResourceId(String resourceId);
    
    
    /* Delete all availability windows for a specific resource*/
    void deleteByResourceId(String resourceId);
}
