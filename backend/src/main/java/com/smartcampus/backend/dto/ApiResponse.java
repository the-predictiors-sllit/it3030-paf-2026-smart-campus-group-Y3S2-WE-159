package com.smartcampus.backend.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private String status;
    private T data;

    @JsonProperty("_links")
    private Map<String, ApiLink> links;

    public ApiResponse() {
    }

    public ApiResponse(String status, T data, Map<String, ApiLink> links) {
        this.status = status;
        this.data = data;
        this.links = links;
    }

    public static <T> ApiResponse<T> success(T data, Map<String, ApiLink> links) {
        return new ApiResponse<>("success", data, links);
    }

    public static <T> ApiResponse<T> error(T data) {
        return new ApiResponse<>("error", data, null);
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

    public Map<String, ApiLink> getLinks() {
        return links;
    }

    public void setLinks(Map<String, ApiLink> links) {
        this.links = links;
    }
}
