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
