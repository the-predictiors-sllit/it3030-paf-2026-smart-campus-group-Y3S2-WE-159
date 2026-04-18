package com.smartcampus.backend.dto.auth0;

import com.fasterxml.jackson.annotation.JsonProperty;

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
public class Auth0RoleResponse {
    private String id;
    private String name;
    private String description;

    @Builder.Default
    @JsonProperty("_links")
    private Map<String, Object> links = new HashMap<>();
}
