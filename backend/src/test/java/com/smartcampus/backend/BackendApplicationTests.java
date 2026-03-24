package com.smartcampus.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:contextdb;DB_CLOSE_DELAY=-1;MODE=LEGACY",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"minio.endpoint=http://localhost:9000",
		"minio.accessKey=test",
		"minio.secretKey=test"
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
