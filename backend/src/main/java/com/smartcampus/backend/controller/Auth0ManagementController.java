package com.smartcampus.backend.controller;

import java.net.URLEncoder;
import org.springframework.http.HttpHeaders;
import java.nio.charset.StandardCharsets;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

import com.smartcampus.backend.config.Auth0ManagementProperties;
import com.smartcampus.backend.dto.ApiResponse;
import com.smartcampus.backend.dto.auth0.Auth0RoleDto;
import com.smartcampus.backend.dto.auth0.Auth0RoleResponse;
import com.smartcampus.backend.dto.auth0.Auth0UserDto;
import com.smartcampus.backend.dto.auth0.Auth0UserResponse;
import com.smartcampus.backend.service.Auth0ManagementApiService;
import com.smartcampus.backend.service.Auth0ManagementTokenService;

import jakarta.servlet.http.HttpServletRequest;
import reactor.core.publisher.Mono;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/api/auth0/management")
@CrossOrigin(origins = "http://localhost:3000")
public class Auth0ManagementController {

        private final RestClient restClient;
        private final Auth0ManagementProperties props;
        private final Auth0ManagementTokenService tokenService;
        private final WebClient webClient;

        public Auth0ManagementController(Auth0ManagementProperties props, Auth0ManagementTokenService tokenService,
                        WebClient webClient) {
                this.props = props;
                this.tokenService = tokenService;
                this.webClient = webClient;
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

        // ---------------------------------------------------------------------

        // create user
        // @PostMapping("/users")
        // public ResponseEntity<?> createUser(
        // @RequestBody Object body, // Accepts any {} or []
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.post()
        // .uri(uriBuilder -> uriBuilder
        // .path("/users")
        // .build())
        // .header("Authorization", "Bearer " + token)
        // .body(body)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toEntity(Object.class);
        // }

        @PostMapping("/users")
        public Mono<ResponseEntity<String>> createUser(
                        @RequestBody String body,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/";
                return webClient.post()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .header("Content-Type", "application/json")
                                .bodyValue(body)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(b -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(b)));
        }

        // ----------------------------------------------------------------------

        // delete user
        // @DeleteMapping("/users/{id}")
        // public ResponseEntity<?> deleteUsers(
        // @PathVariable String id,
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.delete()
        // .uri(uriBuilder -> uriBuilder
        // .path("/users/{id}")
        // .build(id))
        // .header("Authorization", "Bearer " + token)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toBodilessEntity();
        // }

        @DeleteMapping("/users/{id}")
        public Mono<ResponseEntity<String>> deleteUser(
                        @PathVariable String id,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/" + id;
                return webClient.delete()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(body -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(body)));
        }

        // ----------------------------------------------------------------------------

        // //initial template
        // @DeleteMapping("/proxy/**")
        // public Mono<ResponseEntity<String>> proxyDelete(
        // HttpServletRequest request,
        // @RequestHeader HttpHeaders headers) {
        // String url = "https://api.com" + request.getRequestURI().replace("/proxy",
        // "");

        // return forwardRequest(HttpMethod.DELETE, url, headers, null);
        // }

        // ----------------------------------------------------------------------------

        // get user
        // @GetMapping("/users/{id}")
        // public ResponseEntity<?> getUser(
        // @PathVariable String id,
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.get()
        // .uri(uriBuilder -> uriBuilder
        // .path("/users/{id}")
        // .build(id))
        // .header("Authorization", "Bearer " + token)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toEntity(Object.class);
        // }

        @GetMapping("/users/{id}")
        public Mono<ResponseEntity<String>> getUser(
                        @PathVariable String id,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/" + id;
                return webClient.get()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(body -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(body)));
        }

        // ------------------------------------------------------------------------------------
        // update user details
        // @PatchMapping("/users/{id}")
        // public ResponseEntity<?> updateUserDetails(
        // @PathVariable String id,
        // @RequestBody Object body, // Accepts any {} or []
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.patch()
        // .uri(uriBuilder -> uriBuilder
        // .path("/users/{id}")
        // .build(id))
        // .header("Authorization", "Bearer " + token)
        // .body(body)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toEntity(Object.class);
        // }

        @PatchMapping("/users/{id}")
        public Mono<ResponseEntity<String>> updateUserDetails(
                        @PathVariable String id,
                        @RequestBody String body,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/" + id;
                return webClient.patch()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .header("Content-Type", "application/json")
                                .bodyValue(body)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(b -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(b)));
        }

        // ---------------------------------------------------------------------------------

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

        // ------------------------------------------------------------------------
        // remove user role
        // @DeleteMapping("/users/{id}/roles")
        // public ResponseEntity<?> removeUserRole(
        // @PathVariable String id,
        // @RequestBody Object body, // to get the role id
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.method(HttpMethod.DELETE) // other delete did not support
        // body
        // .uri(uriBuilder -> uriBuilder
        // .path("/users/{id}/roles")
        // .build(id))
        // .header("Authorization", "Bearer " + token)
        // .body(body)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toBodilessEntity();
        // }


        @DeleteMapping("/users/{id}/roles")
        public Mono<ResponseEntity<String>> removeUserRole(
                        @PathVariable String id,
                        @RequestBody String body,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/" + id + "/roles";
                return webClient.method(HttpMethod.DELETE)
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .header("Content-Type", "application/json")
                                .bodyValue(body)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(b -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(b)));
        }
        /*
        {
        "roles": [
                "string"
                ]
        }
        */

        // ----------------------------------------------------------------------------------
        // assign a role for the user
        // @PostMapping("/users/{id}/roles")
        // public ResponseEntity<?> assignRole(
        // @PathVariable String id,
        // @RequestBody Object body, // to get user id
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.post()
        // .uri(uriBuilder -> uriBuilder
        // .path("/users/{id}/roles")
        // .build(id))
        // .header("Authorization", "Bearer " + token)
        // .body(body)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toEntity(Object.class);
        // }

        @PostMapping("/users/{id}/roles")
        public Mono<ResponseEntity<String>> assignRole(
                        @PathVariable String id,
                        @RequestBody String body,
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/users/" + id + "/roles";
                return webClient.post()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .header("Content-Type", "application/json")
                                .bodyValue(body)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(b -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(b)));
        }



        /*
        {
        "roles": [
                "string"
                ]
        }
        */

        // --------------------------------------------------------------------------------
        // get all roles
        // @GetMapping("/roles")
        // public ResponseEntity<?> getRoles(
        // Authentication authentication) {
        // String token = tokenService.getAccessToken();

        // return restClient.get()
        // .uri(uriBuilder -> uriBuilder
        // .path("/roles")
        // .build())
        // .header("Authorization", "Bearer " + token)
        // .retrieve()
        // .onStatus(status -> !status.is2xxSuccessful(),
        // (request, response) -> {
        // byte[] body_bytes = response.getBody().readAllBytes();
        // if (response.getStatusCode().is4xxClientError()) {
        // throw new HttpClientErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // } else {
        // throw new HttpServerErrorException(
        // response.getStatusCode(),
        // response.getStatusText(),
        // response.getHeaders(), body_bytes,
        // StandardCharsets.UTF_8);
        // }
        // })
        // .toEntity(Object.class);
        // }

        @GetMapping("/roles")
        public Mono<ResponseEntity<String>> getRoles(
                        Authentication authentication,
                        HttpServletRequest request,
                        @RequestHeader HttpHeaders headers) {
                String token = tokenService.getAccessToken();
                String url = props.apiBaseUrl() + "/roles";
                return webClient.get()
                                .uri(url)
                                .header("Authorization", "Bearer " + token)
                                .exchangeToMono(response -> response.bodyToMono(String.class)
                                                .defaultIfEmpty("")
                                                .map(body -> ResponseEntity
                                                                .status(response.statusCode())
                                                                .body(body)));
        }

        // -------------------------------------------------------------------------

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
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("statusCode", ex.getStatusCode().value());

                try {
                        Object auth0Response = ex.getResponseBodyAs(Object.class);
                        if (auth0Response instanceof Map) {
                                Map<String, Object> auth0Map = (Map<String, Object>) auth0Response;
                                errorResponse.putAll(auth0Map);
                        }
                } catch (Exception e) {
                        errorResponse.put("error", ex.getStatusText());
                        errorResponse.put("message", ex.getMessage());
                }

                return ResponseEntity
                                .status(ex.getStatusCode())
                                .body(errorResponse);
        }

}
