package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String imageUrl;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    @Builder.Default
    @JsonProperty("_links")
    private Map<String, Object> links = new HashMap<>();
}