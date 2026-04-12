# Smart Campus Backend API Reference

Base URL: `http://localhost:8118`

## Authentication

All protected endpoints require:

- Header: `Authorization: Bearer <jwt_access_token>`
- Token source: frontend sends Auth0 JWT bearer token
- Backend user ID source: JWT `sub` claim

Role mapping is derived from JWT authorities (for example `ROLE_ADMIN`, `ROLE_TECHNICIAN`, `ROLE_USER`).

## Response Envelope

Most endpoints return:

```json
{
  "status": "success|error",
  "data": {},
  "error": {
    "code": "...",
    "message": "..."
  },
  "_links": {}
}
```

## Health

### GET `/actuator/health`
- Auth: Public
- Purpose: container health check

### GET `/health`
- Auth: Public
- Purpose: simple health endpoint

## Auth

### POST `/api/auth/register`
- Auth: Any authenticated user
- Purpose: sync logged-in user profile into local DB
- Body: none
- Reads from JWT claims:
  - `sub` (user id)
  - `https://smartcampus.api/name`
  - `https://smartcampus.api/email`
  - `https://smartcampus.api/roles`

### GET `/api/auth/me`
- Auth: Any authenticated user
- Purpose: get current profile from local DB
- Body: none

## Resources

### GET `/api/resources`
- Auth: Any authenticated user
- Query params:
  - `type` (ROOM|LAB|EQUIPMENT)
  - `status` (ACTIVE|OUT_OF_SERVICE)
  - `minCapacity` (int)
  - `page` (default 1)
  - `limit` (default 10)

### GET `/api/resources/{id}`
- Auth: Any authenticated user
- Path params:
  - `id` resource id

### GET `/api/resources/{id}/availability`
- Auth: Any authenticated user
- Path params:
  - `id` resource id

### POST `/api/resources`
- Auth: `ADMIN`
- Body:

```json
{
  "name": "Main Lecture Hall A",
  "type": "ROOM",
  "capacity": 150,
  "location": "Building 1, Floor 2",
  "status": "ACTIVE",
  "description": "High-tech lecture hall",
  "imageUrl": "resources/1711025800_1001_room.jpg",
  "availabilityWindows": [
    {
      "day": "MONDAY",
      "startTime": "08:00",
      "endTime": "18:00"
    }
  ]
}
```

### PUT `/api/resources/{id}`
- Auth: `ADMIN`
- Path params:
  - `id` resource id
- Body: same fields as create, all optional

### DELETE `/api/resources/{id}`
- Auth: `ADMIN`
- Path params:
  - `id` resource id

## Bookings

### POST `/api/bookings`
- Auth: Any authenticated user
- Behavior: booking is created under JWT `sub` user id
- Body:

```json
{
  "resourceId": "res_room_01",
  "startTime": "2026-04-20T10:00:00",
  "endTime": "2026-04-20T12:00:00",
  "purpose": "Study session",
  "expectedAttendees": 8
}
```

### GET `/api/bookings/me`
- Auth: Any authenticated user
- Behavior: only current user bookings
- Query params:
  - `status`
  - `resourceId`
  - `page` (default 1)
  - `limit` (default 10)

### GET `/api/bookings`
- Auth: `ADMIN`
- Behavior: all bookings
- Query params:
  - `status`
  - `resourceId`
  - `userId`
  - `page` (default 1)
  - `limit` (default 10)

### GET `/api/bookings/{id}`
- Auth: Any authenticated user
- Behavior: `ADMIN` can access any booking; non-admin can access only own booking
- Path params:
  - `id` booking id

### PATCH `/api/bookings/{id}/status`
- Auth: `ADMIN`
- Body:

```json
{
  "status": "APPROVED",
  "reason": "Optional reason"
}
```

### DELETE `/api/bookings/{id}`
- Auth: `ADMIN`

## Tickets

### POST `/api/tickets`
- Auth: Any authenticated user
- Behavior: ticket created under JWT `sub`
- Body:

```json
{
  "resourceId": "res_room_01",
  "location": "Building 1, Floor 2",
  "category": "HARDWARE",
  "priority": "HIGH",
  "description": "Projector is flickering.",
  "contactPhone": "555-0192",
  "attachments": [
    "tickets/1711025800_1001_projector.jpg"
  ]
}
```

### GET `/api/tickets/me`
- Auth: Any authenticated user
- Behavior: current user tickets only (`createdBy == JWT sub`)
- Query params:
  - `status`
  - `assignedTo`
  - `resourceId`
  - `page` (default 1)
  - `limit` (default 10)

### GET `/api/tickets`
- Auth: `ADMIN`
- Behavior: all tickets
- Query params:
  - `status`
  - `createdBy`
  - `assignedTo`
  - `resourceId`
  - `page` (default 1)
  - `limit` (default 10)

### GET `/api/tickets/{id}`
- Auth: Any authenticated user
- Behavior:
  - `ADMIN` and `TECHNICIAN`: allowed
  - Others: only if ticket owner (`createdBy`) or assignee

### PATCH `/api/tickets/{id}`
- Auth: `ADMIN` or `TECHNICIAN`
- Body (all optional):

```json
{
  "status": "IN_PROGRESS",
  "assignedTo": "usr_9001",
  "resolutionNotes": "Investigating"
}
```

### DELETE `/api/tickets/{id}`
- Auth: `ADMIN`

## Ticket Comments

### POST `/api/tickets/{id}/comments`
- Auth: Any authenticated user
- Access: same ticket visibility rules as `GET /api/tickets/{id}`
- Body:

```json
{
  "text": "I will check this by 2 PM"
}
```

### GET `/api/tickets/{id}/comments`
- Auth: Any authenticated user
- Access: same ticket visibility rules as `GET /api/tickets/{id}`

### PATCH `/api/tickets/{id}/comments/{commentId}`
- Auth: Any authenticated user
- Access: comment author only
- Body:

```json
{
  "text": "Updated comment text"
}
```

### DELETE `/api/tickets/{id}/comments/{commentId}`
- Auth: Any authenticated user
- Access: comment author or `ADMIN`

## File Upload

Supports ticket images and resource images using separate MinIO object prefixes.

### POST `/api/upload`
- Auth: Any authenticated user
- Content-Type: `multipart/form-data`
- Form fields:
  - `file` (required, image)
  - `folder` (optional: `ticket` or `resource`, default `ticket`)
- Allowed MIME types:
  - `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Max size: 10 MB
- Returns generated object key, for example:
  - `tickets/1711025800_1001_screen.jpg`
  - `resources/1711025800_2001_room.jpg`

### DELETE `/api/upload?fileName={objectKey}`
- Auth: Any authenticated user
- Query params:
  - `fileName` full object key (recommended for prefixed keys)

### DELETE `/api/upload/{fileName}`
- Auth: Any authenticated user
- Notes:
  - Works for simple keys without nested path segments
  - Prefer query-based delete for folder-prefixed keys

## Notifications

### GET `/api/notifications`
- Auth: Any authenticated user
- Behavior: only current user's notifications
- Query params:
  - `read=true|false` (optional)

### GET `/api/notifications/{id}`
- Auth: Any authenticated user
- Behavior: only current user's notification by id

### PATCH `/api/notifications/{id}/read`
- Auth: Any authenticated user
- Behavior: marks only current user's notification as read

### PATCH `/api/notifications/read-all`
- Auth: Any authenticated user
- Behavior: marks all current user notifications as read

### POST `/api/notifications`
- Auth: `ADMIN`
- Purpose: internal/manual notification creation

## Admin/Test Endpoints

### `/api/test/**`
- Auth: `ADMIN`

### `/api/incidents/**`
- Auth: `ADMIN`

## Common Error Codes

- `UNAUTHORIZED` invalid/missing JWT or missing `sub`
- `FORBIDDEN` authenticated but not allowed for that resource
- `*_VALIDATION_ERROR` input validation failures
- `*_NOT_FOUND` entity not found
- `INTERNAL_ERROR` unhandled server error
