package com.smartcampus.backend.controller;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.model.User;
import com.smartcampus.backend.service.UserService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.smartcampus.backend.dto.ApiResponse;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    // Called by frontend after very first login (Now safely protected by Auth0 validation!)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@AuthenticationPrincipal Jwt jwt){
        String auth0Id = jwt.getSubject();

        // Read profile traits from the custom Auth0 namespace claims.
        String name = jwt.getClaimAsString("https://smartcampus.api/name");
        String email = jwt.getClaimAsString("https://smartcampus.api/email");

        // Failsafe 
        if(name == null) name = "Unknown User";
        if(email == null) email = "unknown@university.edu";

        List<String> roles = jwt.getClaimAsStringList("https://smartcampus.api/roles");
        // System.out.println(roles);
        String role = resolveRole(roles);

        User user = userService.syncUser(auth0Id, name, email, role); //if user not in the db this add/update the user

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole());

        ApiResponse<Map<String, Object>> response = new ApiResponse<>("success", data);
        response.addLink("self", Map.of("href", "/api/auth/register"));
        response.addLink("profile", Map.of("href", "/api/auth/me"));

        return ResponseEntity.ok(response);
    }

    private String resolveRole(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return "USER";
        }

        if (roles.contains("ADMIN")) {
            return "ADMIN";
        }
        if (roles.contains("TECHNICIAN")) {
            return "TECHNICIAN";
        }
        return "USER";
    }


    // Get current logged-in user profile
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal Jwt jwt) {
        User user = userService.getUser(jwt.getSubject());

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "data", Map.of(
                "id",    user.getId(),
                "name",  user.getName(),
                "email", user.getEmail(),
                "role",  user.getRole()
            )
        ));
    }


    

}
