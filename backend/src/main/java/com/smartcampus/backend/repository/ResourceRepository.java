package com.smartcampus.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.smartcampus.backend.model.Resource;

import java.util.List;

/*
 * Repository interface for Resource entity.
 * Provides database operations using Spring Data JPA.
 */
public interface ResourceRepository extends JpaRepository<Resource, String> {
    
    /* Find resources by type*/
    List<Resource> findByType(String type);
    
    /* Find resources by status */
    List<Resource> findByStatus(String status);
    
    /* Find resources by type and status*/
    List<Resource> findByTypeAndStatus(String type, String status);
    
    /* Find resources with minimum capacity*/
    @Query("SELECT r FROM Resource r WHERE r.capacity >= :minCapacity OR r.capacity IS NULL")
    List<Resource> findByMinCapacity(@Param("minCapacity") Integer minCapacity);
    
    /* Find resources by type with minimum capacity */
    @Query("SELECT r FROM Resource r WHERE r.type = :type AND (r.capacity >= :minCapacity OR r.capacity IS NULL)")
    List<Resource> findByTypeAndMinCapacity(@Param("type") String type, @Param("minCapacity") Integer minCapacity);
}
