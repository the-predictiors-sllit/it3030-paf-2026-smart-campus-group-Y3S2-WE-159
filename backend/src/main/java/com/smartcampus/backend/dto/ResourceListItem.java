package com.smartcampus.backend.dto;

import java.util.HashMap;
import java.util.Map;

// DTO for resource list item with HATEOAS links.
public class ResourceListItem {
    private String id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private Map<String, Object> _links;

    // Constructors
    public ResourceListItem() {
        this._links = new HashMap<>();
    }

    public ResourceListItem(String id, String name, String type, Integer capacity, 
                           String location, String status) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.capacity = capacity;
        this.location = location;
        this.status = status;
        this._links = new HashMap<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Map<String, Object> get_links() { return _links; }
    public void set_links(Map<String, Object> _links) { this._links = _links; }

    public void addLink(String rel, Map<String, String> link) {
        this._links.put(rel, link);
    }
}
