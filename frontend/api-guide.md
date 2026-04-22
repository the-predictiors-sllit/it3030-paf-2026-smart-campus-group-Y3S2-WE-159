# Backend API Guide for Frontend Developers

This document describes the backend API contract currently implemented in the Smart Campus backend. It focuses on the response envelope, endpoint patterns, request payloads, query parameters, and error handling rules the frontend depends on.

## Base Conventions

- Base path for application APIs: `/api`
- Most endpoints return JSON wrapped in `ApiResponse<T>`
- Most write endpoints return `201 Created`, `200 OK`, or `204 No Content`
- `Cache-Control` is module-dependent:
  - Resources list/detail/availability: `public, max-age=300`
  - Bookings, tickets, notifications: `no-store`
- Protected routes derive user identity from the JWT `sub` claim

## Standard Response Envelope

Success shape:

```json
{
  "status": "success",
  "data": {},
  "error": null,
  "_links": {
    "self": { "href": "/api/..." }
  }
}
```

Error shape:

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found: res_room_01"
  },
  "_links": {}
}
```

Frontend rule: always check `status` first, then read `data` on success or `error.code`/`error.message` on failure.

## Resource API

### GET `/api/resources`

Lists resources with optional filtering and pagination.

Query parameters:

- `search` optional text search on resource name
- `type` optional filter: `ROOM`, `LAB`, `EQUIPMENT`
- `status` optional filter: `ACTIVE`, `OUT_OF_SERVICE`
- `minCapacity` optional minimum capacity
- `page` 1-based page number, default `1`
- `limit` items per page, default `10`

Response `data` shape:

```json
{
  "items": [
    {
      "id": "res_room_01",
      "name": "Main Lecture Hall A",
      "type": "ROOM",
      "capacity": 150,
      "location": "Building 1, Floor 2",
      "status": "ACTIVE",
      "imageUrl": "resources/sample_main_lecture_hall_a.jpg",
      "_links": {
        "self": { "href": "/api/resources/res_room_01" }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

Envelope `_links` may include `self`, `next`, and `prev`.

### GET `/api/resources/{id}`

Returns a full resource record.

Main fields:

- `id`
- `name`
- `type`
- `capacity`
- `location`
- `status`
- `description`
- `imageUrl`
- `availabilityWindows` (array of `{ day, startTime, endTime }`)
- `createdAt`

### GET `/api/resources/{id}/availability`

Returns only availability data.

Response `data` shape:

```json
{
  "resourceId": "res_room_01",
  "items": [
    {
      "day": "MONDAY",
      "startTime": "08:00:00.0000000",
      "endTime": "17:00:00.0000000"
    }
  ]
}
```

### POST `/api/resources`

Creates a resource.

Request body example:

```json
{
  "name": "Main Lecture Hall A",
  "type": "ROOM",
  "capacity": 150,
  "location": "Building 1, Floor 2",
  "status": "ACTIVE",
  "description": "High-tech lecture room with 2 projectors.",
  "imageUrl": "resources/sample_main_lecture_hall_a.jpg",
  "availabilityWindows": [
    {
      "day": "MONDAY",
      "startTime": "08:00:00",
      "endTime": "17:00:00"
    }
  ]
}
```

`status` is optional and defaults to `ACTIVE` if omitted.

### PUT `/api/resources/{id}`

Updates a resource using partial-update semantics. All fields are optional.

Important behavior:

- If `availabilityWindows` is omitted, existing windows remain unchanged.
- If `availabilityWindows` is provided as an empty array, all existing windows are removed.

### DELETE `/api/resources/{id}`

Deletes the resource and its availability windows.

Success response: `204 No Content`.

## Booking API

### GET `/api/bookings`

Lists bookings with optional filtering and pagination.

Query parameters:

- `status` optional: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- `resourceId` optional resource filter
- `userId` optional user filter
- `page` default `1`
- `limit` default `10`

Response `data` shape:

```json
{
  "items": [
    {
      "id": "bkg_20260421122201_1234",
      "resource": {
        "id": "res_room_01",
        "name": "Resource res_room_01"
      },
      "user": {
        "id": "auth0|abc123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "startTime": "2026-04-23T10:00:00",
      "endTime": "2026-04-23T11:00:00",
      "status": "PENDING",
      "_links": {
        "self": { "href": "/api/bookings/bkg_20260421122201_1234" },
        "resource": { "href": "/api/resources/res_room_01" },
        "resource_availability": { "href": "/api/resources/res_room_01/availability" }
      }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

### GET `/api/bookings/me`

Same response shape and filters as `GET /api/bookings`, except user identity is always derived from JWT. Do not send `userId` from frontend.

Supported query parameters:

- `status`
- `resourceId`
- `page`
- `limit`

### POST `/api/bookings`

Creates a booking request for the authenticated user.

Request body:

```json
{
  "resourceId": "res_room_01",
  "startTime": "2026-04-23T10:00:00",
  "endTime": "2026-04-23T11:00:00",
  "purpose": "Database lab",
  "expectedAttendees": 40
}
```

Backend validation includes:

- JWT user identity exists (`sub` claim)
- start/end time validity
- no past bookings
- overlap conflict detection
- booking must be within configured resource availability windows
- booking must start and end on the same day

### GET `/api/bookings/{id}`

Returns full booking details.

Non-admin users can only access their own bookings.

Response fields include:

- `id`
- `resourceId`
- `userId`
- `startTime`
- `endTime`
- `purpose`
- `expectedAttendees`
- `status`
- `reason`
- `createdAt`
- `updatedAt`

### PATCH `/api/bookings/{id}/status`

Updates booking status.

Request body:

```json
{
  "status": "APPROVED",
  "reason": "Optional note"
}
```

Rules:

- Allowed status values: `APPROVED`, `REJECTED`, `CANCELLED`
- `reason` is mandatory when status is `REJECTED`
- Only `PENDING` bookings can be approved/rejected

### DELETE `/api/bookings/{id}`

Deletes a booking.

Success response: `204 No Content`.

## Ticket API

### GET `/api/tickets`

Query parameters:

- `status` optional ticket status
- `createdBy` optional creator filter
- `assignedTo` optional technician filter
- `resourceId` optional resource filter
- `page` default `1`
- `limit` default `10`

### GET `/api/tickets/me`

Same endpoint behavior as list, but user is derived from JWT. No explicit `createdBy` should be sent.

### POST `/api/tickets`

Creates a maintenance ticket. Attachments are typically uploaded first, then referenced by file name in the ticket payload.

### GET `/api/tickets/{id}`

Returns full ticket details, including nested comments and attachments.

## Notifications API

### GET `/api/notifications`

Query parameter:

- `read` optional boolean filter
  - `true` returns read notifications
  - `false` returns unread notifications
  - omitted returns all notifications

List response keeps notifications in `data.items`.

### GET `/api/notifications/{id}`

Returns one notification owned by the authenticated user.

### PATCH `/api/notifications/{id}/read`

Marks one notification as read.

### PATCH `/api/notifications/read-all`

Marks all notifications as read.

## Error Handling Guide

Use these status branches in frontend handling:

- `400 Bad Request` validation/query issues
- `401 Unauthorized` missing or invalid bearer token
- `403 Forbidden` authenticated but not allowed
- `404 Not Found` entity missing or inaccessible
- `409 Conflict` business rule conflict (for example booking overlap)
- `500 Internal Server Error` unexpected backend failure

Common backend error codes:

- `RESOURCE_VALIDATION_ERROR`
- `RESOURCE_QUERY_VALIDATION_ERROR`
- `RESOURCE_NOT_FOUND`
- `BOOKING_VALIDATION_ERROR`
- `BOOKING_QUERY_VALIDATION_ERROR`
- `BOOKING_CONFLICT`
- `BOOKING_NOT_FOUND`
- `TICKET_VALIDATION_ERROR`
- `TICKET_QUERY_VALIDATION_ERROR`
- `TICKET_NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `INTERNAL_ERROR`

## Frontend Handling Notes

- Always guard against `data === null` when `status === "error"`.
- Prefer backend `_links` for navigation targets between related resources.
- Keep list-page filter/pagination state in URL query params.
- For resource cards/details, use backend-provided `imageUrl` directly.
- On `401`, trigger login/session refresh flow.

## Practical Example

For a resource list page:

1. Request `GET /api/resources?search=lab&type=LAB&page=1&limit=10`
2. Read `response.data.items`
3. Render each card using `name`, `capacity`, `location`, `status`, and `imageUrl`
4. Use `response._links.next` / `response._links.prev` for pagination controls

Keep this guide aligned with backend controller and DTO changes.