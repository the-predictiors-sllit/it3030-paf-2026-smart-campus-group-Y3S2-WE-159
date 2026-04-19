package com.smartcampus.backend.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClient;

import com.smartcampus.backend.config.Auth0ManagementProperties;
import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.auth0.Auth0RoleDto;
import com.smartcampus.backend.dto.auth0.Auth0RoleResponse;
import com.smartcampus.backend.dto.auth0.Auth0UserDto;
import com.smartcampus.backend.dto.auth0.Auth0UserResponse;
import com.smartcampus.backend.service.Auth0ManagementApiService;
import com.smartcampus.backend.service.Auth0ManagementTokenService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/auth0/management")
@CrossOrigin(origins = "http://localhost:3000")
public class Auth0ManagementController {

        private final RestClient restClient;
        private final Auth0ManagementProperties props;
        private final Auth0ManagementTokenService tokenService;

        public Auth0ManagementController(Auth0ManagementProperties props, Auth0ManagementTokenService tokenService) {
                this.props = props;
                this.tokenService = tokenService;
                this.restClient = RestClient.builder().baseUrl(props.apiBaseUrl()).build();
        }

        @Autowired
        Auth0ManagementApiService authService;

        // get all Auth0UserResponse
        @GetMapping("/users")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(Authentication authentication,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int perPage,
                        @RequestParam(required = false) String sort,
                        @RequestParam(required = false) String search) {

                // self link
                Map<String, Object> selfLink = new HashMap<>();
                selfLink.put("href", "/api/auth0/management/users");

                Map<String, Object> createNewUser = new HashMap<>();
                createNewUser.put("href", "/api/auth0/management/users");
                createNewUser.put("method", "POST");

                Map<String, Object> links = new HashMap<>();
                links.put("self", selfLink);
                links.put("create_new_user", createNewUser);

                List<Auth0UserDto> userList = authService.listOfAllUsers(page, perPage, sort,
                                search);

                Map<String, Object> data = new HashMap<>();
                data.put("items", userList.stream().map(this::toUserResponse).toList());

                ApiResponse<Map<String, Object>> response = new ApiResponse<>("success",
                                data, links);

                return ResponseEntity.ok()
                                .header("Cache-Control", "no-store")
                                .body(response);
        }

        // create user
        @PostMapping("/users")
        public ResponseEntity<?> createUser(
                        @RequestBody Object body, // Accepts any {} or []
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.post()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users")
                                                .build())
                                .header("Authorization", "Bearer " + token)
                                .body(body)
                                .retrieve()
                                .toEntity(Object.class);
        }

        // delete user
        @DeleteMapping("/users/{id}")
        public ResponseEntity<?> deleteUsers(
                        @PathVariable String id,
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.delete()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users/{id}")
                                                .build(id))
                                .header("Authorization", "Bearer " + token)
                                .retrieve()
                                .toEntity(Object.class);
        }

        // get user
        @GetMapping("/users/{id}")
        public ResponseEntity<?> getUser(
                        @PathVariable String id,
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.get()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users/{id}")
                                                .build(id))
                                .header("Authorization", "Bearer " + token)
                                .retrieve()
                                .toEntity(Object.class);
        }

        // update user details
        @PatchMapping("/users/{id}")
        public ResponseEntity<?> updateUserDetails(
                        @PathVariable String id,
                        @RequestBody Object body, // Accepts any {} or []
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.patch()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users/{id}")
                                                .build(id))
                                .header("Authorization", "Bearer " + token)
                                .body(body)
                                .retrieve()
                                .toEntity(Object.class);
        }

        private Auth0UserResponse toUserResponse(Auth0UserDto dto) {
                Auth0UserResponse response = Auth0UserResponse.builder()
                                .userId(dto.getUserId())
                                .name(dto.getName())
                                .nickname(dto.getNickname())
                                .givenName(dto.getGivenName())
                                .familyName(dto.getFamilyName())
                                .email(dto.getEmail())
                                .picture(dto.getPicture())
                                .emailVerified(dto.isEmailVerified())
                                .createdAt(dto.getCreatedAt())
                                .updatedAt(dto.getUpdatedAt())
                                .lastLogin(dto.getLastLogin())
                                .lastIp(dto.getLastIp())
                                .loginsCount(dto.getLoginsCount())
                                .build();

                response.setLinks(buildAuth0UserLinks(dto));
                return response;
        }

        private Map<String, Object> buildAuth0UserLinks(Auth0UserDto dto) {
                Map<String, Object> links = new HashMap<>();
                links.put("self", createLink("/api/auth0/management/users/"
                                + URLEncoder.encode(dto.getUserId(), StandardCharsets.UTF_8)));
                links.put("update_user_details",
                                createLinkWithMethod("/api/auth0/management/users/"
                                                + URLEncoder.encode(dto.getUserId(), StandardCharsets.UTF_8), "PATCH"));
                links.put("delete_user",
                                createLinkWithMethod("/api/auth0/management/users/"
                                                + URLEncoder.encode(dto.getUserId(), StandardCharsets.UTF_8),
                                                "DELETE"));
                links.put("get_all_roles", createLinkWithMethod("/api/auth0/management/roles", "GET"));
                links.put("get_user_role",
                                createLinkWithMethod(
                                                "/api/auth0/management/users/" + URLEncoder.encode(dto.getUserId(),
                                                                StandardCharsets.UTF_8) + "/roles",
                                                "GET"));
                links.put("remove_user_role",
                                createLinkWithMethod(
                                                "/api/auth0/management/users/" + URLEncoder.encode(dto.getUserId(),
                                                                StandardCharsets.UTF_8) + "/roles",
                                                "DELETE"));
                links.put("Assign_user_role",
                                createLinkWithMethod(
                                                "/api/auth0/management/users/" + URLEncoder.encode(dto.getUserId(),
                                                                StandardCharsets.UTF_8) + "/roles",
                                                "POST"));
                return links;
        }

        // get user role
        @GetMapping("/users/{id}/roles")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getRoleOfUser(
                        @PathVariable String id,
                        Authentication authentication) {

                Map<String, Object> selfLink = new HashMap<>();
                selfLink.put("href", "/api/auth0/management/users/" + URLEncoder.encode(id, StandardCharsets.UTF_8)
                                + "/roles");

                Map<String, Object> links = new HashMap<>();
                links.put("self", selfLink);

                List<Auth0RoleDto> roleList = authService.getRoleNamesForUser(id);

                Map<String, Object> data = new HashMap<>();
                data.put("items", roleList.stream().map(this::toRoleResponse).toList());

                ApiResponse<Map<String, Object>> response = new ApiResponse<>("success", data, links);

                return ResponseEntity.ok()
                                .header("Cache-Control", "no-store")
                                .body(response);

        }

        // remove user role
        @DeleteMapping("/users/{id}/roles")
        public ResponseEntity<?> removeUserRole(
                        @PathVariable String id,
                        @RequestBody Object body, // to get the role id
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.method(HttpMethod.DELETE) // other delete did not support body
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users/{id}/roles")
                                                .build(id))
                                .header("Authorization", "Bearer " + token)
                                .body(body)
                                .retrieve()
                                .toEntity(Object.class);
        }

        // assign a role for the user
        @PostMapping("/users/{id}/roles")
        public ResponseEntity<?> assignRole(
                        @PathVariable String id,
                        @RequestBody Object body, // to get user id
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.post()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/users/{id}/roles")
                                                .build(id))
                                .header("Authorization", "Bearer " + token)
                                .body(body)
                                .retrieve()
                                .toEntity(Object.class);
        }

        // get all roles
        @GetMapping("/roles")
        public ResponseEntity<?> getRoles(
                        Authentication authentication) {
                String token = tokenService.getAccessToken();

                return restClient.get()
                                .uri(uriBuilder -> uriBuilder
                                                .path("/roles")
                                                .build())
                                .header("Authorization", "Bearer " + token)
                                .retrieve()
                                .toEntity(Object.class);
        }

        private Auth0RoleResponse toRoleResponse(Auth0RoleDto dto) {
                Auth0RoleResponse response = Auth0RoleResponse.builder()
                                .id(dto.getId())
                                .name(dto.getName())
                                .description(dto.getDescription())
                                .build();

                response.setLinks(buildAuth0RoleLinks(dto));
                return response;
        }

        private Map<String, Object> buildAuth0RoleLinks(Auth0RoleDto dto) {
                Map<String, Object> links = new HashMap<>();
                links.put("self", createLink("/api/auth0/management/users/"
                                + URLEncoder.encode(dto.getId(), StandardCharsets.UTF_8) + "/roles"));
                links.put("get_all_roles", createLinkWithMethod("/api/auth0/management/roles", "GET"));
                links.put("remove_user_role",
                                createLinkWithMethod("/api/auth0/management/users/"
                                                + URLEncoder.encode(dto.getId(), StandardCharsets.UTF_8) + "/roles",
                                                "DELETE"));
                links.put("Assign_user_role",
                                createLinkWithMethod("/api/auth0/management/users/"
                                                + URLEncoder.encode(dto.getId(), StandardCharsets.UTF_8) + "/roles",
                                                "POST"));
                return links;

        }

        private Map<String, String> createLinkWithMethod(String href, String method) {
                Map<String, String> link = new HashMap<>();
                link.put("href", href);
                link.put("method", method);
                return link;
        }

        private Map<String, String> createLink(String href) {
                Map<String, String> link = new HashMap<>();
                link.put("href", href);
                return link;
        }

        @ExceptionHandler(HttpStatusCodeException.class)
        public ResponseEntity<?> handleAuth0SpecificError(HttpStatusCodeException ex) {
                // This will ONLY trigger for errors in THIS controller
                return ResponseEntity
                                .status(ex.getStatusCode())
                                .body(ex.getResponseBodyAs(Object.class));
        }

}
