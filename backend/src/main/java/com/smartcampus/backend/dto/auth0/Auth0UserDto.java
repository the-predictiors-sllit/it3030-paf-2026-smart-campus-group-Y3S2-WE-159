package com.smartcampus.backend.dto.auth0;

import com.fasterxml.jackson.annotation.JsonProperty;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auth0UserDto {
    @JsonProperty("user_id")
    private String userId;
    private String name;
    private String nickname;
    @JsonProperty("given_name")
    private String givenName;
    @JsonProperty("family_name")
    private String familyName;
    private String email;
    private String picture;
    @JsonProperty("email_verified")
    private boolean emailVerified;
    @JsonProperty("created_at")
    private String createdAt;
    @JsonProperty("updated_at")
    private String updatedAt;
    @JsonProperty("last_login")
    private String lastLogin;
    @JsonProperty("last_ip")
    private String lastIp;
    @JsonProperty("logins_count")
    private Integer loginsCount;
}
