package com.smartcampus.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${auth0.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri:}")
    private String jwkSetUri;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http, 
            JwtDecoder jwtDecoder, 
            JwtAuthenticationConverter jwtAuthenticationConverter) throws Exception {
                
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/health").permitAll()

                .requestMatchers(HttpMethod.POST, "/api/auth/register").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/bookings").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/bookings/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/bookings/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/bookings/*/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/*").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/resources", "/api/resources/*", "/api/resources/*/availability").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/resources").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/resources/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/tickets").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tickets/me").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tickets/*", "/api/tickets/*/comments").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/tickets").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/tickets/*/comments").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/tickets/*/comments/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/tickets/*/comments/*").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/upload").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/upload/view").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/upload/*").authenticated()

                .requestMatchers(HttpMethod.POST, "/api/notifications").hasRole("ADMIN")
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/test/**").hasRole("ADMIN")


                // .requestMatchers(HttpMethod.POST, "/api/admin/auth0/sync-users").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder) // Use the injected parameter
                    .jwtAuthenticationConverter(jwtAuthenticationConverter) // Use the injected parameter
                )
            );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        String normalizedIssuer = normalizeIssuer(issuerUri);
        String resolvedJwkSetUri = (jwkSetUri == null || jwkSetUri.isBlank())
            ? normalizedIssuer + ".well-known/jwks.json"
            : jwkSetUri.trim();

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(resolvedJwkSetUri)
            .jwsAlgorithm(SignatureAlgorithm.RS256)
            .build();

        OAuth2TokenValidator<Jwt> audienceValidator = token ->
            token.getAudience().contains(audience)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid audience", null));

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(normalizedIssuer);
        OAuth2TokenValidator<Jwt> combined =
            new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator);

        decoder.setJwtValidator(combined);
        return decoder;
    }

    private String normalizeIssuer(String issuer) {
        if (issuer == null) {
            return null;
        }

        String normalized = issuer.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized + "/";
    }


    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        // CORRECTION: Direct Spring Security to the exact custom Auth0 Roles claim mapping
        converter.setAuthoritiesClaimName("https://smartcampus.api/roles");
        converter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }
}
