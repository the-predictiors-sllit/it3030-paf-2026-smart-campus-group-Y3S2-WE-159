package com.smartcampus.backend.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

public final class SecurityContextUtil {

    private SecurityContextUtil() {
    }

    public static String getUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }
        return jwt.getSubject();
    }

    public static boolean hasRole(Authentication authentication, String role) {
        if (authentication == null || role == null || role.isBlank()) {
            return false;
        }

        String expected = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (expected.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
