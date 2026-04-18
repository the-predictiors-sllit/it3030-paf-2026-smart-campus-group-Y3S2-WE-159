package com.smartcampus.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.bind.annotation.RestController;
import com.smartcampus.backend.config.Auth0ManagementProperties;
import org.springframework.web.bind.annotation.GetMapping;

@EnableConfigurationProperties(Auth0ManagementProperties.class)
@SpringBootApplication
@RestController
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// do not delete this part yet.
	@GetMapping("/health")
	public String healthCheck() {
		String message = "This is a Health Check";
		return message;
	}
}
