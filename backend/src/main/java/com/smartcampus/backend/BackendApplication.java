package com.smartcampus.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.model.TestEntity;
import com.smartcampus.backend.repository.TestRepository;

import org.springframework.web.bind.annotation.GetMapping;

@SpringBootApplication
@RestController
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	// do not delete this part yet. front container is depending on this
	@GetMapping("/health")
	public String healthCheck() {
		String message = "This is a Health Check";
		return message;
	}

	// This runs automatically when the app starts
	// @Bean
	// CommandLineRunner initDatabase(TestRepository repository) {
	// 	return args -> {
	// 		if (repository.count() == 0) {
	// 			repository.save(new TestEntity("Sample Data 1"));
	// 			System.out.println("Initial data saved!");
	// 		}
	// 	};
	// }

}
