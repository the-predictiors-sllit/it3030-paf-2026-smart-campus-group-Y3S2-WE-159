package com.smartcampus.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.backend.dto.auth0.Auth0RoleDto;
import com.smartcampus.backend.dto.auth0.Auth0UserDto;
import com.smartcampus.backend.model.User;

@Service
public class Auth0UserSyncService {

    private final Auth0ManagementApiService auth0Api;
    private final UserService userService;

    public Auth0UserSyncService(Auth0ManagementApiService auth0Api, UserService userService) {
        this.auth0Api = auth0Api;
        this.userService = userService;
    }

    @Transactional
    public int syncAllUsers() {
        int synced = 0;
        int page = 0;
        int perPage = 50;

        while (true) {
            List<Auth0UserDto> users = auth0Api.listUsers(page, perPage);
            if (users.isEmpty()) {
                break;
            }

            for (Auth0UserDto u : users) {
                if (u.getUserId() == null || u.getEmail() == null) {
                    continue;
                }

                    List<Auth0RoleDto> auth0Roles = auth0Api.getRoleNamesForUser(u.getUserId());
            }

            if (users.size() < perPage) {
                break;
            }
            page++;
        }

        return synced;
    }

    private String mapRole(List<Auth0RoleDto> roles) {
        if (roles == null || roles.isEmpty()) {
            return "USER";
        }
        if (roles.stream().map(Auth0RoleDto::getName).anyMatch(r -> "ADMIN".equalsIgnoreCase(r))) {
            return "ADMIN";
        }
        if (roles.stream().map(Auth0RoleDto::getName).anyMatch(r -> "TECHNICIAN".equalsIgnoreCase(r))) {
            return "TECHNICIAN";
        }
        return "USER";
    }
}