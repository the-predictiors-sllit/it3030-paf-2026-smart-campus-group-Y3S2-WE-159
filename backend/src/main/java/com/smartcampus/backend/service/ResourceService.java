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
    private static final DateTimeFormatter RAW_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss.SSSSSSS");
    
    /* Create a new resource. */
    
    public ResourceResponse createResource(CreateResourceRequest request) {
        //validation
        validateResourceRequest(request);

        // Generate unique resource ID
        String resourceId = generateResourceId(request.getType());
        
        // Create new resource entity
        Resource resource = new Resource(
            resourceId, request.getName(), request.getType(), request.getCapacity(),
            request.getLocation(), request.getStatus() != null ? request.getStatus() : "ACTIVE", request.getDescription(), request.getImageUrl()
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

    public List<ResourceResponse.AvailabilityWindow> getResourceAvailability(String resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new NoSuchElementException("Resource not found: " + resourceId);
        }

        return availabilityRepository.findByResourceId(resourceId)
            .stream()
            .map(a -> new ResourceResponse.AvailabilityWindow(
                a.getDayOfWeek(),
                formatRawTime(a.getStartTime()),
                formatRawTime(a.getEndTime())
            ))
            .collect(Collectors.toList());
    }

    // Update an existing resource
    public ResourceResponse updateResource(String resourceId, UpdateResourceRequest request) {
        // Retrieve resource
        Resource resource = resourceRepository.findById(resourceId)
            .orElseThrow(() -> new NoSuchElementException("Resource not found: " + resourceId));
        
        // Update fields if provided
        if (request.getName() != null) {
            resource.setName(request.getName());
        }
        if (request.getType() != null) {
            if (!isValidType(request.getType())) {
                throw new IllegalArgumentException("Invalid resource type: " + request.getType());
            }
            resource.setType(request.getType());
        }
        if (request.getCapacity() != null) {
            resource.setCapacity(request.getCapacity());
        }
        if (request.getLocation() != null) {
            resource.setLocation(request.getLocation());
        }
        if (request.getStatus() != null) {
            if (!isValidStatus(request.getStatus())) {
                throw new IllegalArgumentException("Invalid resource status: " + request.getStatus());
            }
            resource.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            resource.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            resource.setImageUrl(request.getImageUrl());
        }
        
        // Save updated resource
        Resource updatedResource = resourceRepository.save(resource);
        
        // Update availability windows if provided
        if (request.getAvailabilityWindows() != null) {
            // Delete existing availability
            availabilityRepository.deleteByResourceId(resourceId);
            // Save new availability
            if (!request.getAvailabilityWindows().isEmpty()) {
                saveAvailabilityWindows(resourceId, request.getAvailabilityWindows());
            }
        }
        
        return convertToResourceResponse(updatedResource);
    }

    //Delete a resource
    public void deleteResource(String resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new NoSuchElementException("Resource not found: " + resourceId);
        }
        
        // Delete availability windows first
        availabilityRepository.deleteByResourceId(resourceId);
        
        // Delete resource
        resourceRepository.deleteById(resourceId);
    }

        public ListResourcesResponse listResources(String search,String type, String status, Integer minCapacity, int page, int limit) {
        int validatedPage = Math.max(page, 1);
        int validatedLimit = Math.max(limit, 1);
        
        List<Resource> resources;
        
        // Apply filters
        if (type != null && !type.isEmpty() && status != null && !status.isEmpty() && minCapacity != null) {
            resources = resourceRepository.findByTypeAndMinCapacity(type, minCapacity)
                .stream()
                .filter(r -> status.equals(r.getStatus()))
                .collect(Collectors.toList());
        } else if (type != null && !type.isEmpty() && status != null && !status.isEmpty()) {
            resources = resourceRepository.findByTypeAndStatus(type, status);
        } else if (type != null && !type.isEmpty() && minCapacity != null) {
            resources = resourceRepository.findByTypeAndMinCapacity(type, minCapacity);
        } else if (type != null && !type.isEmpty()) {
            resources = resourceRepository.findByType(type);
        } else if (status != null && !status.isEmpty()) {
            resources = resourceRepository.findByStatus(status);
        } else if (minCapacity != null) {
            resources = resourceRepository.findByMinCapacity(minCapacity);
        } else {
            resources = resourceRepository.findAll();
        }
        
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.toLowerCase();
            resources = resources.stream()
                .filter(r -> r.getName().toLowerCase().contains(searchLower))
                .collect(Collectors.toList());
        }
        
        // Sort by name
        resources.sort(Comparator.comparing(Resource::getName));
        
        // Calculate pagination
        int total = resources.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / validatedLimit);
        
        // Apply pagination
        int startIdx = (validatedPage - 1) * validatedLimit;
        int endIdx = Math.min(startIdx + validatedLimit, total);

        List<ResourceListItem> paginatedItems = startIdx >= total
            ? Collections.emptyList()
            : resources.subList(startIdx, endIdx)
                .stream()
                .map(this::convertToResourceListItem)
                .collect(Collectors.toList());
        
        return new ListResourcesResponse(paginatedItems, total, validatedPage, totalPages);
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

            if (availabilityRepository.countMatchingWindow(
                resourceId,
                window.getDay(),
                startTime,
                endTime
            ) > 0) {
                continue;
            }

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
                formatRawTime(a.getStartTime()),
                formatRawTime(a.getEndTime())
            ))
            .collect(Collectors.toList());
            
        return new ResourceResponse(
            resource.getId(), 
            resource.getName(), 
            resource.getType(), 
            resource.getCapacity(),
            resource.getLocation(), 
            resource.getStatus(), 
            resource.getDescription(),
            resource.getImageUrl(),
            windows, 
            resource.getCreatedAt()
        );
    }

    /*Convert Resource entity to ResourceListItem DTO with HATEOAS links.*/
    private ResourceListItem convertToResourceListItem(Resource resource) {
        ResourceListItem item = new ResourceListItem(
            resource.getId(),
            resource.getName(),
            resource.getType(),
            resource.getCapacity(),
            resource.getLocation(),
            resource.getStatus()
        );
        
        // Add HATEOAS links
        Map<String, String> selfLink = new HashMap<>();
        selfLink.put("href", "/api/resources/" + resource.getId());
        item.addLink("self", selfLink);
        
        return item;
    }

    private String formatRawTime(LocalTime time) {
        return time.format(RAW_TIME_FORMATTER);
    }

}
