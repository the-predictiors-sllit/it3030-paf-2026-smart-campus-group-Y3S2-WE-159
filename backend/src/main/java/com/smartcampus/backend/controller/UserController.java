package com.smartcampus.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.config.SecurityContextUtil;
import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.UserDTO;
import com.smartcampus.backend.dto.UserResponse;
import com.smartcampus.backend.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(Authentication authentication) {

        // user validation
        String userId = SecurityContextUtil.getUserId(authentication);
        if (userId == null || userId.isBlank()) {
            return errorResponse(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Missing or invalid bearer token");
        }

        // self link
        Map<String, Object> selfLink = new HashMap<>();
        selfLink.put("href", "/api/users");

        // all links
        Map<String, Object> links = new HashMap<>();
        links.put("self", selfLink);

        List<UserDTO> userList = userService.getAllUsers();
        // data
        Map<String, Object> data = new HashMap<>();
        data.put("items", userList.stream().map(this::toUserResponse).toList());

        ApiResponse<Map<String, Object>> response = new ApiResponse<>("success", data, links);

        return ResponseEntity.ok()
                .header("Cache-Control", "no-store")
                .body(response);

    }

    private UserResponse toUserResponse(UserDTO dto) {
        UserResponse response = UserResponse.builder()
                .id(dto.getId())
                .email(dto.getEmail())
                .name(dto.getName())
                .imageUrl(dto.getImageUrl())
                .role(dto.getRole())
                .createdAt(dto.getCreatedAt())
                .build();

        response.setLinks(buildUserLinks(dto));
        return response;
    }

    // links
    private Map<String, Object> buildUserLinks(UserDTO dto) {
        Map<String, Object> links = new HashMap<>();
        links.put("self", createLink("/api/users/" + dto.getId()));
        return links;
    }

    private Map<String, String> createLink(String href) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        return link;
    }

    // private Map<String, String> createLinkWithMethod(String href, String method) {
    //     Map<String, String> link = new HashMap<>();
    //     link.put("href", href);
    //     link.put("method", method);
    //     return link;
    // }

    // errors
    private <T> ResponseEntity<ApiResponse<T>> errorResponse(HttpStatus status, String code, String message) {
        ApiResponse<T> error = new ApiResponse<>("error", null);
        error.setError(code, message);
        return ResponseEntity.status(status).body(error);
    }

}
