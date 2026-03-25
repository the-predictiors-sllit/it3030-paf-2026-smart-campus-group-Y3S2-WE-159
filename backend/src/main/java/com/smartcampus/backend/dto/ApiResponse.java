package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashMap;
import java.util.Map;

/**
 * Generic API Response wrapper for all REST endpoints.
 * Follows the specification structure with status, data, and _links.
 */
public class ApiResponse<T> {
    private String status;
    private T data;
    @JsonProperty("_links")
    private Map<String, Object> _links;

    public ApiResponse(String status, T data) {
        this.status = status;
        this.data = data;
        this._links = new HashMap<>();
    }

    public ApiResponse(String status, T data, Map<String, Object> links) {
        this.status = status;
        this.data = data;
        this._links = links;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
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
