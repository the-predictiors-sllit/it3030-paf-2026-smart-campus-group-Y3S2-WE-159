package com.smartcampus.backend.service;

// import java.util.Arrays;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

import com.smartcampus.backend.config.Auth0ManagementProperties;
import com.smartcampus.backend.dto.auth0.Auth0RoleDto;
import com.smartcampus.backend.dto.auth0.Auth0UserDto;

@Service
public class Auth0ManagementApiService {

    private final RestClient restClient;
    private final Auth0ManagementProperties props;
    private final Auth0ManagementTokenService tokenService;

    public Auth0ManagementApiService(Auth0ManagementProperties props, Auth0ManagementTokenService tokenService) {
        this.props = props;
        this.tokenService = tokenService;
        this.restClient = RestClient.builder().baseUrl(props.apiBaseUrl()).build();
    }

    // this is for sync
    public List<Auth0UserDto> listUsers(int page, int perPage) {
        String token = tokenService.getAccessToken();

        List<Auth0UserDto> users = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users")
                        .queryParam("page", page)
                        .queryParam("per_page", perPage)
                        .queryParam("include_totals", false)
                        .build())
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Auth0UserDto>>() {
                });

        return users == null ? Collections.emptyList() : users;
    }

    // -----------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------
    // this is for the endpoint
    public List<Auth0UserDto> listOfAllUsers(int page, int perPage, String sort, String search) {
        String token = tokenService.getAccessToken();

        List<Auth0UserDto> users = restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/users")
                            .queryParam("page", page)
                            .queryParam("per_page", perPage)
                            .queryParam("include_totals", false)
                            .queryParam("search_engine", "v3");

                    // Only add sort and q if they are actually provided
                    if (sort != null && !sort.isBlank())
                        uriBuilder.queryParam("sort", sort);
                    if (search != null && !search.isBlank())
                        uriBuilder.queryParam("q", search);

                    return uriBuilder.build();
                })
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), 
                        (request, response) -> {
                            byte[] body_bytes = response.getBody().readAllBytes();
                            if (response.getStatusCode().is4xxClientError()) {
                                throw new HttpClientErrorException(response.getStatusCode(), 
                                    response.getStatusText(), response.getHeaders(), body_bytes, StandardCharsets.UTF_8);
                            } else {
                                throw new HttpServerErrorException(response.getStatusCode(), 
                                    response.getStatusText(), response.getHeaders(), body_bytes, StandardCharsets.UTF_8);
                            }
                        })
                .body(new ParameterizedTypeReference<List<Auth0UserDto>>() {
                });

        return users == null ? Collections.emptyList() : users;
    }


    // -----------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------
    // roles
    public List<Auth0RoleDto> getRoleNamesForUser(String auth0UserId) {
        String token = tokenService.getAccessToken();

        List<Auth0RoleDto> roles = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users/{id}/roles")
                        .build(auth0UserId))
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), 
                        (request, response) -> {
                            byte[] body_bytes = response.getBody().readAllBytes();
                            if (response.getStatusCode().is4xxClientError()) {
                                throw new HttpClientErrorException(response.getStatusCode(), 
                                    response.getStatusText(), response.getHeaders(), body_bytes, StandardCharsets.UTF_8);
                            } else {
                                throw new HttpServerErrorException(response.getStatusCode(), 
                                    response.getStatusText(), response.getHeaders(), body_bytes, StandardCharsets.UTF_8);
                            }
                        })
                .body(new ParameterizedTypeReference<List<Auth0RoleDto>>() {
                });

        if (roles == null) {
            return Collections.emptyList();
        } else {
            return roles;
        }
    }

    // // array example
    // public List<String> getRoleNamesForUser(String auth0UserId) {
    // String token = tokenService.getAccessToken();

    // Auth0RoleDto[] roles = restClient.get()
    // .uri("/users/{id}/roles", auth0UserId)
    // .header("Authorization", "Bearer " + token)
    // .retrieve()
    // .body(Auth0RoleDto[].class);

    // if (roles == null) {
    // return Collections.emptyList();
    // }

    // return Arrays.stream(roles)
    // .map(Auth0RoleDto::getName)
    // .toList();
    // }
}
