# Auth0 Management API Integration (Backend)

This guide is tailored for your current backend:
- Spring Boot + Spring Security Resource Server
- Existing user table: `Users` (`Id`, `Name`, `Email`, `Role`)
- Existing user sync on login in `AuthController` + `UserService`

Goal:
1. Call Auth0 Management API at `https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/`
2. Pull users (and roles) from Auth0
3. Upsert into your `Users` table
4. Keep Auth0 and DB in sync with manual + scheduled sync

---

## 1. Create a Machine-to-Machine App in Auth0

In Auth0 Dashboard:
1. Applications -> Create Application -> Machine to Machine Applications
2. Authorize it to Auth0 Management API
3. Grant scopes:
   - `read:users`
   - `read:users_app_metadata`
   - `read:roles`
   - `read:users`
   - `read:user_idp_tokens` (optional)
4. Save the generated credentials:
   - Client ID
   - Client Secret
   - Domain (`dev-4cikw3sue0vwsly0.us.auth0.com`)

Token endpoint:
`https://dev-4cikw3sue0vwsly0.us.auth0.com/oauth/token`

Management audience:
`https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/`

---

## 2. Add Environment Variables

In your backend environment (or `.env` if you already load it):

```env
AUTH0_MGMT_DOMAIN=dev-4cikw3sue0vwsly0.us.auth0.com
AUTH0_MGMT_CLIENT_ID=YOUR_M2M_CLIENT_ID
AUTH0_MGMT_CLIENT_SECRET=YOUR_M2M_CLIENT_SECRET
AUTH0_MGMT_AUDIENCE=https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/
```

In `application.properties`:

```properties
auth0.management.domain=${AUTH0_MGMT_DOMAIN}
auth0.management.client-id=${AUTH0_MGMT_CLIENT_ID}
auth0.management.client-secret=${AUTH0_MGMT_CLIENT_SECRET}
auth0.management.audience=${AUTH0_MGMT_AUDIENCE}

# Optional scheduler toggle
app.auth0-sync.enabled=true
app.auth0-sync.cron=0 0/30 * * * *
```

---

## 3. Add Config Properties Class

Create `src/main/java/com/smartcampus/backend/config/Auth0ManagementProperties.java`

```java
package com.smartcampus.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "auth0.management")
public class Auth0ManagementProperties {

    private String domain;
    private String clientId;
    private String clientSecret;
    private String audience;

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String tokenUrl() {
        return "https://" + domain + "/oauth/token";
    }

    public String apiBaseUrl() {
        return "https://" + domain + "/api/v2";
    }
}
```

Enable it in your app main class:

```java
@EnableConfigurationProperties(Auth0ManagementProperties.class)
@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

---

## 4. Get Management API Access Token (Client Credentials)

Create `src/main/java/com/smartcampus/backend/service/Auth0ManagementTokenService.java`

```java
package com.smartcampus.backend.service;

import java.time.Instant;
import java.util.Map;

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

        if (response == null || !response.containsKey("access_token")) {
            throw new IllegalStateException("Auth0 token response missing access_token");
        }

        cachedToken = (String) response.get("access_token");
        Number expiresIn = (Number) response.getOrDefault("expires_in", 3600);
        expiresAt = Instant.now().plusSeconds(expiresIn.longValue());

        return cachedToken;
    }
}
```

---

## 5. Call Auth0 Management API (Users + Roles)

Create `src/main/java/com/smartcampus/backend/dto/auth0/Auth0UserDto.java`

```java
package com.smartcampus.backend.dto.auth0;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Auth0UserDto {
    @JsonProperty("user_id")
    private String userId;
    private String name;
    private String email;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
```

Create `src/main/java/com/smartcampus/backend/dto/auth0/Auth0RoleDto.java`

```java
package com.smartcampus.backend.dto.auth0;

public class Auth0RoleDto {
    private String id;
    private String name;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

Create `src/main/java/com/smartcampus/backend/service/Auth0ManagementApiService.java`

```java
package com.smartcampus.backend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
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

    public List<String> getRoleNamesForUser(String auth0UserId) {
        String token = tokenService.getAccessToken();

        Auth0RoleDto[] roles = restClient.get()
                .uri("/users/{id}/roles", auth0UserId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(Auth0RoleDto[].class);

        if (roles == null) {
            return Collections.emptyList();
        }

        return Arrays.stream(roles)
                .map(Auth0RoleDto::getName)
                .toList();
    }
}
```

---

## 6. Sync Auth0 Data into Your Users Table

You already have `UserService.syncUser(auth0Id, name, email, role)`. Reuse that.

Create `src/main/java/com/smartcampus/backend/service/Auth0UserSyncService.java`

```java
package com.smartcampus.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

                List<String> auth0Roles = auth0Api.getRoleNamesForUser(u.getUserId());
                User.Role localRole = mapRole(auth0Roles);

                String safeName = (u.getName() == null || u.getName().isBlank()) ? "Unknown User" : u.getName();
                userService.syncUser(u.getUserId(), safeName, u.getEmail(), localRole);
                synced++;
            }

            if (users.size() < perPage) {
                break;
            }
            page++;
        }

        return synced;
    }

    private User.Role mapRole(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return User.Role.USER;
        }
        if (roles.stream().anyMatch(r -> "ADMIN".equalsIgnoreCase(r))) {
            return User.Role.ADMIN;
        }
        if (roles.stream().anyMatch(r -> "TECHNICIAN".equalsIgnoreCase(r))) {
            return User.Role.TECHNICIAN;
        }
        return User.Role.USER;
    }
}
```

---

## 7. Add Admin Endpoint for Manual Sync

Create `src/main/java/com/smartcampus/backend/controller/Auth0SyncController.java`

```java
package com.smartcampus.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.service.Auth0UserSyncService;

@RestController
@RequestMapping("/api/admin/auth0")
public class Auth0SyncController {

    private final Auth0UserSyncService syncService;

    public Auth0SyncController(Auth0UserSyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/sync-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> syncUsers() {
        int count = syncService.syncAllUsers();
        return ResponseEntity.ok(Map.of("status", "success", "syncedUsers", count));
    }
}
```

Your `SecurityConfig` already uses role checks. If needed, add:

```java
.requestMatchers(HttpMethod.POST, "/api/admin/auth0/sync-users").hasRole("ADMIN")
```

---

## 8. Optional Scheduled Sync (Every 30 Minutes)

Create `src/main/java/com/smartcampus/backend/config/SchedulingConfig.java`

```java
package com.smartcampus.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
}
```

Create `src/main/java/com/smartcampus/backend/service/Auth0SyncScheduler.java`

```java
package com.smartcampus.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Auth0SyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(Auth0SyncScheduler.class);

    private final Auth0UserSyncService syncService;

    @Value("${app.auth0-sync.enabled:true}")
    private boolean enabled;

    public Auth0SyncScheduler(Auth0UserSyncService syncService) {
        this.syncService = syncService;
    }

    @Scheduled(cron = "${app.auth0-sync.cron:0 0/30 * * * *}")
    public void runSync() {
        if (!enabled) {
            return;
        }

        int synced = syncService.syncAllUsers();
        log.info("Auth0 sync completed. Synced {} users", synced);
    }
}
```

---

## 9. Database Sync Strategy (Recommended)

Use a hybrid approach:
1. Login-time sync (already implemented in your `AuthController`): fast, per-user upsert
2. Scheduled sync (new): catches missed updates, role changes, renamed users
3. Admin manual sync endpoint (new): immediate reconciliation

Optional cleanup step:
- Keep a `lastSeenAt` timestamp in `Users`
- During full sync, update `lastSeenAt` for each synced user
- Mark local users as inactive if not seen for N sync runs

---

## 10. Test Quickly

### Get a Management API token directly

```bash
curl --request POST \
  --url https://dev-4cikw3sue0vwsly0.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_M2M_CLIENT_ID",
    "client_secret":"YOUR_M2M_CLIENT_SECRET",
    "audience":"https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/",
    "grant_type":"client_credentials"
  }'
```

### List users from Management API

```bash
curl --request GET \
  --url 'https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/users?page=0&per_page=10' \
  --header 'authorization: Bearer YOUR_MGMT_API_TOKEN'
```

### Trigger backend sync endpoint

```bash
curl -X POST http://localhost:8080/api/admin/auth0/sync-users \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

---

## 11. Common Pitfalls

- Wrong audience: must be exactly `https://dev-4cikw3sue0vwsly0.us.auth0.com/api/v2/`
- Missing scopes on M2M app -> Management calls return 403
- Role names mismatch (`Admin` vs `ADMIN`) -> normalize before mapping
- Email collisions in local DB if multiple identity providers share same email
- Rate limits on large tenants: keep `per_page` reasonable and add retry/backoff for 429

---

## 12. Where This Fits in Your Current Code

- Existing login-time user upsert: `AuthController` + `UserService.syncUser(...)`
- New pieces from this guide:
  - Management token service
  - Management API client service
  - Full sync service
  - Admin sync controller
  - Optional scheduler

This gives you continuous Auth0 -> database consistency without changing your current JWT validation flow.
