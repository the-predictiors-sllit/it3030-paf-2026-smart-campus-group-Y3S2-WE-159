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

public class Auth0UserResponse {
    private String userId;
    private String name;
    private String nickname;
    private String givenName;
    private String familyName;
    private String email;
    private String picture;
    private boolean emailVerified;
    private String createdAt;
    private String updatedAt;
    private String lastLogin;
    private String lastIp;
    private int loginsCount;

    @Builder.Default
    @JsonProperty("_links")
    private Map<String, Object> links = new HashMap<>();
}
