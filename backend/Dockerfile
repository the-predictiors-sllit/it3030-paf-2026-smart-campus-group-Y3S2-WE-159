FROM container-registry.oracle.com/java/openjdk:25.0.2
WORKDIR /app

# Install necessary utilities
RUN --mount=type=cache,target=/var/cache/yum \
    dnf install -y findutils curl && \
    dnf clean all

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw

# Cache dependency download
RUN --mount=type=cache,target=/root/.m2 \
    ./mvnw dependency:go-offline

COPY src ./src

EXPOSE 8080
CMD ["./mvnw", "spring-boot:run"]