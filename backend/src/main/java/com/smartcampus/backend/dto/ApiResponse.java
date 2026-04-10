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
    private ErrorDetail error;
    @JsonProperty("_links")
    private Map<String, Object> _links;

    public ApiResponse(String status, T data) {
        this.status = status;
        this.data = data;
        this.error = null;
        this._links = new HashMap<>();
    }

    public ApiResponse(String status, T data, Map<String, Object> links) {
        this.status = status;
        this.data = data;
        this.error = null;
        this._links = links;
    }

    public static class ErrorDetail {
        private String code;
        private String message;

        public ErrorDetail() {
        }

        public ErrorDetail(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
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

    public ErrorDetail getError() {
        return error;
    }

    public void setError(ErrorDetail error) {
        this.error = error;
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

    public void setError(String code, String message) {
        this.error = new ErrorDetail(code, message);
    }
}
