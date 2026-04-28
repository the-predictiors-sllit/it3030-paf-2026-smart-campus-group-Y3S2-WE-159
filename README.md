# Smart_University_web_application# Smart University Web Application

IT3030 – Programming Applications and Frameworks




```bash
docker-compose -f docker-compose.yml up --build
docker-compose -f docker-compose.production.yml up --build
```

install ollama on your device
```bash
ollama pull qwen3.5:2b-q8_0
```




## Dev container
01. Press Ctrl + Shift + P (Windows/Linux) or Cmd + Shift + P (Mac).
02. Type "Dev Containers: Reopen in Container".
03. Hit Enter.(wait untill vs code automatically download all the extentions.)


## Project Description

Smart Campus Operations Hub is a web-based platform for managing university facilities, bookings, and maintenance incidents.

## Tech Stack

Backend: Spring Boot REST API  
Frontend: React.js  
Database: MySQL / PostgreSQL  
Authentication: OAuth 2.0 (Google Login)

## Features

- Facility & Asset Management
- Resource Booking System
- Maintenance Ticket System
- Notifications
- Role-Based Access Control

## Team Members

- Member 1 – Facilities Module
- Member 2 – Booking Module
- Member 3 – Ticket Module
- Member 4 – Authentication & Notifications

## Project Structure

backend/
frontend/
docs/






## for bugs

If you ever find that your .mvn folder is missing or corrupted, you don't need to manually install files. You can "re-generate" the Maven Wrapper by running this command in the terminal inside your project directory:


```bash
mvn wrapper:wrapper
```
