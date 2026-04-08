package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.ResourceAvailability;
import com.smartcampus.backend.repository.ResourceRepository;
import com.smartcampus.backend.repository.ResourceAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {
    
    @Autowired
    private ResourceRepository resourceRepository;
    
    @Autowired
    private ResourceAvailabilityRepository availabilityRepository;
    
    private static final DateTimeFormatter ID_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    
    /* Create a new resource. */
    
    public ResourceResponse createResource(CreateResourceRequest request) {
        //validation
        validateResourceRequest(request);

        // Generate unique resource ID
        String resourceId = generateResourceId(request.getType());
        
        //// Create new resource entity
        Resource resource = new Resource(
            resourceId, request.getName(), request.getType(), request.getCapacity(),
            request.getLocation(), request.getStatus() != null ? request.getStatus() : "ACTIVE", request.getDescription()
        );
        
        // Save resource
        Resource savedResource = resourceRepository.save(resource);
        
        // Save availability windows if provided
        if (request.getAvailabilityWindows() != null && !request.getAvailabilityWindows().isEmpty()) {
            saveAvailabilityWindows(resourceId, request.getAvailabilityWindows());
        }

        //convert to response DTO
        return convertToResourceResponse(savedResource);
    }

    //Get a specific resource by ID
    public ResourceResponse getResource(String resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new NoSuchElementException("Resource not found: " + resourceId));
        return convertToResourceResponse(resource);
    }


    // Helper Methods for Create
    private void validateResourceRequest(CreateResourceRequest request) {
        if (request.getName() == null || request.getName().isEmpty()) throw new IllegalArgumentException("Resource name is required");
        if (request.getType() == null || request.getType().isEmpty()) throw new IllegalArgumentException("Resource type is required");
        if (!isValidType(request.getType())) throw new IllegalArgumentException("Invalid resource type: " + request.getType());
        if (request.getStatus() != null && !isValidStatus(request.getStatus())) throw new IllegalArgumentException("Invalid resource status: " + request.getStatus());
        if (request.getName().length() > 100) throw new IllegalArgumentException("Resource name must not exceed 100 characters");
    }
    
    //check if type is valid
    private boolean isValidType(String type) {
        return type != null && (type.equals("ROOM") || type.equals("LAB") || type.equals("EQUIPMENT"));
    }
    
    //check if status is valid
    private boolean isValidStatus(String status) {
        return status != null && (status.equals("ACTIVE") || status.equals("OUT_OF_SERVICE"));
    }
    
    //generate resource ID based on type and current time
    private String generateResourceId(String type) {
        String timestamp = LocalTime.now().format(DateTimeFormatter.ofPattern("HHmmss"));
        String typePrefix = type.toLowerCase().substring(0, 3);
        return "res_" + typePrefix + "_" + timestamp;
    }
    
    //save availability windows for a resource
    private void saveAvailabilityWindows(String resourceId, List<CreateResourceRequest.AvailabilityWindow> windows) {
        for (CreateResourceRequest.AvailabilityWindow window : windows) {
            LocalTime startTime = LocalTime.parse(window.getStartTime());
            LocalTime endTime = LocalTime.parse(window.getEndTime());
            ResourceAvailability availability = new ResourceAvailability(
                resourceId, 
                window.getDay(), 
                startTime, 
                endTime
            );
            availabilityRepository.save(availability);
        }
    }
    
    //convert Resource entity to ResourceResponse DTO
    private ResourceResponse convertToResourceResponse(Resource resource) {
        List<ResourceAvailability> availabilities = availabilityRepository.findByResourceId(resource.getId());
        List<ResourceResponse.AvailabilityWindow> windows = availabilities.stream()
            .map(a -> new ResourceResponse.AvailabilityWindow(
                a.getDayOfWeek(), 
                a.getStartTime().toString(),
                a.getEndTime().toString()
            ))
            .collect(Collectors.toList());
            
        return new ResourceResponse(
            resource.getId(), 
            resource.getName(), 
            resource.getType(), 
            resource.getCapacity(),
            resource.getLocation(), 
            resource.getStatus(), 
            resource.getDescription(), windows, 
            resource.getCreatedAt()
        );
    }
}
