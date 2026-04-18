package com.smartcampus.backend.service;

import java.time.Instant;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.smartcampus.backend.config.Auth0ManagementProperties;

@Service
public class Auth0ManagementTokenService {

    private final RestClient restClient;
    private final Auth0ManagementProperties props;

    private String cachedToken;
    private Instant expiresAt;

    public Auth0ManagementTokenService(Auth0ManagementProperties props) {
        this.props = props;
        this.restClient = RestClient.builder().build();
    }

    public synchronized String getAccessToken() {
        if (cachedToken != null && expiresAt != null && Instant.now().isBefore(expiresAt.minusSeconds(30))) {
            return cachedToken;
        }

        Map<String, Object> response = restClient.post()
                .uri(props.tokenUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "grant_type", "client_credentials",
                        "client_id", props.getClientId(),
                        "client_secret", props.getClientSecret(),
                        "audience", props.getAudience()))
                .retrieve()
                .body(Map.class);
                // .body(new ParameterizedTypeReference<Map<String, Object>>() {});

        if (response == null || !response.containsKey("access_token")) {
            throw new IllegalStateException("Auth0 token response missing access_token");
        }

        cachedToken = (String) response.get("access_token");
        Number expiresIn = (Number) response.getOrDefault("expires_in", 3600);
        expiresAt = Instant.now().plusSeconds(expiresIn.longValue());

        return cachedToken;
    }
}
