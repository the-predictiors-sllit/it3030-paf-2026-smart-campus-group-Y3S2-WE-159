# Smart Campus Hub
`IT3030 - Programming Applications and Frameworks`
`Sri Lanka Institute of Information Technology - SLIIT`

Smart Campus Hub is a full-stack campus management platform for handling bookings, tickets, resources, notifications, and AI-assisted workflows.


>⚠️ Known Issues
>403 Forbidden Error (Campus Networks)
>
>If you encounter a 403 Forbidden error while pulling Docker images, it is likely due to security restrictions on the campus network. Some institutional firewalls block certain container registries. Please switch to a different network.

It is split into three main application areas:

- `frontend`: Next.js app for the user interface and API proxying
- `backend`: Spring Boot service that exposes the main REST API
- `ai_python`: A Python-based service integrating LangGraph for Ollama-driven AI workflows

The stack also uses SQL Server for persistence and MinIO for storing incident report assets.

## Features

- User-facing campus portal built with Next.js
- Spring Boot backend with SQL Server persistence
- MinIO object storage seeded with initial resources
- AI assistant integration backed by Ollama
- Docker Compose setup for local development and production-style runs

## Prerequisites

- Docker and Docker Compose
- Ollama installed locally if you want to use the AI features

Pull the model used by the AI service:

```bash
ollama pull qwen3.5:2b-q8_0
```

## Run With Docker

### Development

```bash
docker-compose -f docker-compose.yml up --build
```

### Production

```bash
docker-compose -f docker-compose.production.yml up --build
```

To stop the production stack:

```bash
docker-compose -f docker-compose.production.yml down
```

## Service Ports

| Service | URL | Notes |
| --- | --- | --- |
| Frontend | http://localhost:3000 | Next.js app |
| Backend | http://localhost:8118 | Main API exposed by Docker |
| SQL Server | localhost:1433 | Database used by the backend |
| MinIO API | http://localhost:9000 | S3-compatible storage API |
| MinIO Console | http://localhost:9001 | MinIO admin UI |
| AI service | http://localhost:2024 | Python AI service |

## Project Layout

```text
frontend/   Next.js frontend application
backend/    Spring Boot API and database integration
ai_python/  Python AI service and LangGraph-based agent
init.sql    Database initialization script
docker-compose*.yml  Local and production orchestration
```

## Contributors

- Perara P.K.M.P. 
- Erandunu P.H.L.
- Wijewardana P.K.
- Senadeera D.M.K.K.

## Notes

> ⚠️Warning: This project is configured to run inside a Docker container only. To run it locally, you must configure the environment variables and APIs.
- The database and MinIO containers are initialized automatically from `init.sql` and `initialResourcesImage/`.
- The backend health endpoint is used by Docker Compose to wait for startup readiness.
- If the AI assistant fails to start, first verify that Ollama is running locally and that the model is available.

## Screenshots

![Light theme](other/light%20theme.png)
![Dark theme](other/dark%20theme.png)
![AI usage example](other/AI%20usage%20example.png)
















