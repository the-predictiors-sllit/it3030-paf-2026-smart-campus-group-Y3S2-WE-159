package com.smartcampus.backend.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;

import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.auth0.Auth0RoleDto;
import com.smartcampus.backend.dto.auth0.Auth0RoleResponse;
import com.smartcampus.backend.dto.auth0.Auth0UserDto;
import com.smartcampus.backend.dto.auth0.Auth0UserResponse;
import com.smartcampus.backend.service.Auth0ManagementApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/auth0/management")
@CrossOrigin(origins = "http://localhost:3000")
public class Auth0ManagementController {
        @Autowired
        Auth0ManagementApiService authService;

        @GetMapping("/users")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(Authentication authentication,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int perPage,
                        @RequestParam(required = false) String sort,
                        @RequestParam(required = false) String search) {

                // self link
                Map<String, Object> selfLink = new HashMap<>();
                selfLink.put("href", "/api/auth0/management/users");

                Map<String, Object> links = new HashMap<>();
                links.put("self", selfLink);

                List<Auth0UserDto> userList = authService.listOfAllUsers(page, perPage, sort, search);

                Map<String, Object> data = new HashMap<>();
                data.put("items", userList.stream().map(this::toUserResponse).toList());

                ApiResponse<Map<String, Object>> response = new ApiResponse<>("success", data, links);

                return ResponseEntity.ok()
                                .header("Cache-Control", "no-store")
                                .body(response);

        }

        @DeleteMapping("/users/{id}")
        public ResponseEntity<Void> deleteUsers(@PathVariable String id, Authentication authentication) {
                authService.deleteUser(id);
                return ResponseEntity.noContent().build();
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

        @DeleteMapping("/users/{id}/roles")
        public ResponseEntity<Void> deleteRoleOfUsers(@PathVariable String id, Authentication authentication) {
                authService.deleteUserRole(id);
                return ResponseEntity.noContent().build();
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
