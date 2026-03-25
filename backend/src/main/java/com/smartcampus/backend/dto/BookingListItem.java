package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO representing a single booking item in the list response.
 * Includes resource details and HATEOAS links.
 */
public class BookingListItem {
    private String id;
    private ResourceInfo resource;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    @JsonProperty("_links")
    private Map<String, Object> _links;

    // Constructors
    public BookingListItem() {
        this._links = new HashMap<>();
    }

    public BookingListItem(String id, ResourceInfo resource, LocalDateTime startTime,
                          LocalDateTime endTime, String status) {
        this.id = id;
        this.resource = resource;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this._links = new HashMap<>();
    }

    // Static inner class for resource information
    public static class ResourceInfo {
        private String id;
        private String name;

        public ResourceInfo() {
        }

        public ResourceInfo(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ResourceInfo getResource() {
        return resource;
    }

    public void setResource(ResourceInfo resource) {
        this.resource = resource;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Object> get_links() {
        return _links;
    }

    public void set_links(Map<String, Object> _links) {
        this._links = _links;
    }

    public void addLink(String rel, Map<String, String> link) {
        this._links.put(rel, link);
    }
}
