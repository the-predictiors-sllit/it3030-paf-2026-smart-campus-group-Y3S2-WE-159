package com.smartcampus.backend.controller;

import com.smartcampus.backend.config.SecurityContextUtil;
import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**

   Tickets:
      POST   /api/tickets              – Create a new incident ticket
      GET    /api/tickets              – List tickets (with filters + pagination)
      GET    /api/tickets/{id}         – Get full ticket details
      PATCH  /api/tickets/{id}         – Update status / assign technician / add notes
      DELETE /api/tickets/{id}         – Delete a ticket (admin only)
 
    Comments:
      POST   /api/tickets/{id}/comments              – Add a comment
      GET    /api/tickets/{id}/comments              – List all comments on a ticket
      PATCH  /api/tickets/{id}/comments/{commentId}  – Edit own comment
      DELETE /api/tickets/{id}/comments/{commentId}  – Delete own comment (or admin any)
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    // POST /api/tickets

    /**
      Create a new incident ticket.
     
      Request body example:
      {
        "resourceId": "res_room_01",          (optional)
        "location": "Building 1, Floor 2",    (optional if resourceId is given)
        "category": "HARDWARE",
        "priority": "HIGH",
        "description": "Projector is flickering.",
        "contactPhone": "555-0192",
        "attachments": ["1711025800_usr1001_tint1.jpg"]  (pre-uploaded, max 3)
      }
     
      Status Codes:
        201 Created     – Ticket created successfully.
        400 Bad Request – Validation failed.
        500 Internal    – Unexpected error.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(HttpStatus.UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "Missing or invalid bearer token: user id (sub) claim not found");
            }

            TicketResponse ticket = ticketService.createTicket(request, userId);

            ApiResponse<TicketResponse> response = new ApiResponse<>("success", ticket);
            response.addLink("self",        createLink("/api/tickets/" + ticket.getId()));
            response.addLink("add_comment", createLinkWithMethod(
                    "/api/tickets/" + ticket.getId() + "/comments", "POST"));
            response.addLink("update",      createLinkWithMethod(
                    "/api/tickets/" + ticket.getId(), "PATCH"));

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location", "/api/tickets/" + ticket.getId())
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "TICKET_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while creating ticket");
        }
    }

    // GET /api/tickets

    /**
      List tickets with optional filters and pagination.
     
      Query parameters (all optional):
        status     – OPEN | IN_PROGRESS | RESOLVED | CLOSED | REJECTED
        createdBy  – filter to one user's tickets (USER sees only their own)
        assignedTo – filter to a technician's queue
        resourceId – filter to tickets for a specific resource
        page       – page number, default 1
        limit      – items per page, default 10
     
      Status Codes:
        200 OK          – List returned (may be empty).
        400 Bad Request – Invalid filter value.
        500 Internal    – Unexpected error.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ListTicketsResponse>> listTickets(
            @RequestParam(value = "status",     required = false) String status,
            @RequestParam(value = "createdBy",  required = false) String createdBy,
            @RequestParam(value = "assignedTo", required = false) String assignedTo,
            @RequestParam(value = "resourceId", required = false) String resourceId,
            @RequestParam(value = "page",  defaultValue = "1")  int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        try {
            ListTicketsResponse tickets = ticketService.listTickets(
                    createdBy, assignedTo, resourceId, status, page, limit);

            ApiResponse<ListTicketsResponse> response = new ApiResponse<>("success", tickets);

            // Self link
            String queryString = buildQueryString(status, createdBy, assignedTo,
                    resourceId, tickets.getPage(), limit);
            response.addLink("self", createLink("/api/tickets" + queryString));

            // Next page link
            if (tickets.getTotalPages() > 0
                    && tickets.getPage() < tickets.getTotalPages()) {
                String nextQuery = buildQueryString(status, createdBy, assignedTo,
                        resourceId, tickets.getPage() + 1, limit);
                response.addLink("next", createLink("/api/tickets" + nextQuery));
            }

            // Previous page link
            if (tickets.getPage() > 1) {
                String prevQuery = buildQueryString(status, createdBy, assignedTo,
                        resourceId, tickets.getPage() - 1, limit);
                response.addLink("prev", createLink("/api/tickets" + prevQuery));
            }

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "TICKET_QUERY_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while listing tickets");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ListTicketsResponse>> listMyTickets(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "assignedTo", required = false) String assignedTo,
            @RequestParam(value = "resourceId", required = false) String resourceId,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(HttpStatus.UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "Missing or invalid bearer token: user id (sub) claim not found");
            }

            ListTicketsResponse tickets = ticketService.listTickets(
                    userId, assignedTo, resourceId, status, page, limit);

            ApiResponse<ListTicketsResponse> response = new ApiResponse<>("success", tickets);

            String queryString = buildMyQueryString(status, assignedTo, resourceId, tickets.getPage(), limit);
            response.addLink("self", createLink("/api/tickets/me" + queryString));

            if (tickets.getTotalPages() > 0 && tickets.getPage() < tickets.getTotalPages()) {
                String nextQuery = buildMyQueryString(status, assignedTo, resourceId, tickets.getPage() + 1, limit);
                response.addLink("next", createLink("/api/tickets/me" + nextQuery));
            }

            if (tickets.getPage() > 1) {
                String prevQuery = buildMyQueryString(status, assignedTo, resourceId, tickets.getPage() - 1, limit);
                response.addLink("prev", createLink("/api/tickets/me" + prevQuery));
            }

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "TICKET_QUERY_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while listing user tickets");
        }
    }

    // GET /api/tickets/{id}

    /**
      Get full details for a single ticket (includes comments and attachments).
     
      Status Codes:
        200 OK    – Ticket found and returned.
        404 Not Found – Ticket does not exist.
        500 Internal  – Unexpected error.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(
            @PathVariable String id,
            Authentication authentication) {

        try {
            TicketResponse ticket = ticketService.getTicket(id);
            ResponseEntity<ApiResponse<TicketResponse>> accessError = validateTicketAccess(authentication, ticket);
            if (accessError != null) {
                return accessError;
            }

            ApiResponse<TicketResponse> response = new ApiResponse<>("success", ticket);
            response.addLink("self",        createLink("/api/tickets/" + id));
            response.addLink("comments",    createLink("/api/tickets/" + id + "/comments"));
            response.addLink("update",      createLinkWithMethod("/api/tickets/" + id, "PATCH"));
            response.addLink("delete",      createLinkWithMethod("/api/tickets/" + id, "DELETE"));
            response.addLink("add_comment", createLinkWithMethod(
                    "/api/tickets/" + id + "/comments", "POST"));

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "TICKET_NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while fetching ticket");
        }
    }

    // PATCH /api/tickets/{id} 

    /**
      update a ticket.
      Used by ADMIN to approve/reject/assign and by TECHNICIAN to add resolution notes.
     
      Request body (all fields optional):
      {
        "status": "IN_PROGRESS",
        "assignedTo": "usr_9001",
        "resolutionNotes": "Investigating the bulb connection."
      }
     
      Status Codes:
        200 OK          – Ticket updated.
        400 Bad Request – Invalid status or transition.
        404 Not Found   – Ticket not found.
        500 Internal    – Unexpected error.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable String id,
            @RequestBody UpdateTicketRequest request) {

        try {
            TicketResponse ticket = ticketService.updateTicket(id, request);

            ApiResponse<TicketResponse> response = new ApiResponse<>("success", ticket);
            response.addLink("self",     createLink("/api/tickets/" + id));
            response.addLink("comments", createLink("/api/tickets/" + id + "/comments"));
            if (ticket.getAssignedTo() != null) {
                response.addLink("assignee",
                        createLink("/api/users/" + ticket.getAssignedTo()));
            }

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "TICKET_NOT_FOUND", e.getMessage());
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "TICKET_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while updating ticket");
        }
    }

    //  DELETE /api/tickets/{id} 

    /**
      Delete a ticket (admin only).
      Also removes all associated attachment files from Minio.
     
      Status Codes:
        204 No Content – Ticket deleted.
        404 Not Found  – Ticket not found.
        500 Internal   – Unexpected error.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //  POST /api/tickets/{id}/comments

    /**
     Add a comment to a ticket.
     Any authenticated user (USER / ADMIN / TECHNICIAN) can comment.
     
      Request body: { "text": "I will check this out by 2 PM." }
     
      Status Codes:
        201 Created     – Comment added.
        400 Bad Request – Empty text.
        404 Not Found   – Ticket not found.
        500 Internal    – Unexpected error.
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TicketCommentResponse>> addComment(
            @PathVariable String id,
            @RequestBody AddCommentRequest request,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(HttpStatus.UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "Missing or invalid bearer token: user id (sub) claim not found");
            }

            TicketResponse ticket = ticketService.getTicket(id);
            ResponseEntity<ApiResponse<TicketCommentResponse>> accessError = validateTicketAccess(authentication, ticket);
            if (accessError != null) {
                return accessError;
            }

            TicketCommentResponse comment = ticketService.addComment(id, request, userId);

            ApiResponse<TicketCommentResponse> response =
                    new ApiResponse<>("success", comment);
            response.addLink("self",   createLink(
                    "/api/tickets/" + id + "/comments/" + comment.getId()));
            response.addLink("ticket", createLink("/api/tickets/" + id));
            response.addLink("update", createLinkWithMethod(
                    "/api/tickets/" + id + "/comments/" + comment.getId(), "PATCH"));
            response.addLink("delete", createLinkWithMethod(
                    "/api/tickets/" + id + "/comments/" + comment.getId(), "DELETE"));

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .header("Location",
                            "/api/tickets/" + id + "/comments/" + comment.getId())
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "TICKET_NOT_FOUND", e.getMessage());
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "COMMENT_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while adding comment");
        }
    }

    //  GET /api/tickets/{id}/comments 

    /**
      List all comments on a ticket (oldest first).
     
      Status Codes:
        200 OK        – List returned (may be empty).
        404 Not Found – Ticket not found.
        500 Internal  – Unexpected error.
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<TicketCommentResponse>>> listComments(
            @PathVariable String id,
            Authentication authentication) {

        try {
            TicketResponse ticket = ticketService.getTicket(id);
            ResponseEntity<ApiResponse<List<TicketCommentResponse>>> accessError = validateTicketAccess(authentication, ticket);
            if (accessError != null) {
                return accessError;
            }

            List<TicketCommentResponse> comments = ticketService.listComments(id);

            ApiResponse<List<TicketCommentResponse>> response =
                    new ApiResponse<>("success", comments);
            response.addLink("self",       createLink("/api/tickets/" + id + "/comments"));
            response.addLink("ticket",     createLink("/api/tickets/" + id));
            response.addLink("add_comment", createLinkWithMethod(
                    "/api/tickets/" + id + "/comments", "POST"));

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "TICKET_NOT_FOUND", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while fetching comments");
        }
    }

    // ── PATCH /api/tickets/{id}/comments/{commentId} ─────────────────────────

    /**
     * Edit an existing comment.
     * Only the original author can edit their own comment.
     *
     * Request body: { "text": "Updated message here." }
     *
     * Status Codes:
     *   200 OK          – Comment updated.
     *   400 Bad Request – Empty text.
     *   403 Forbidden   – Not the comment author.
     *   404 Not Found   – Ticket or comment not found.
     *   500 Internal    – Unexpected error.
     */
    @PatchMapping("/{id}/comments/{commentId}")
    public ResponseEntity<ApiResponse<TicketCommentResponse>> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody UpdateCommentRequest request,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return errorResponse(HttpStatus.UNAUTHORIZED,
                        "UNAUTHORIZED",
                        "Missing or invalid bearer token: user id (sub) claim not found");
            }

            TicketCommentResponse comment =
                    ticketService.updateComment(id, commentId, request, userId);

            ApiResponse<TicketCommentResponse> response =
                    new ApiResponse<>("success", comment);
            response.addLink("self",   createLink(
                    "/api/tickets/" + id + "/comments/" + commentId));
            response.addLink("ticket", createLink("/api/tickets/" + id));

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-store")
                    .body(response);

        } catch (NoSuchElementException e) {
            return errorResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", e.getMessage());
        } catch (SecurityException e) {
            return errorResponse(HttpStatus.FORBIDDEN,
                    "FORBIDDEN", e.getMessage());
        } catch (IllegalArgumentException e) {
            return errorResponse(HttpStatus.BAD_REQUEST,
                    "COMMENT_VALIDATION_ERROR", e.getMessage());
        } catch (Exception e) {
            return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR", "Unexpected error while updating comment");
        }
    }

    // ── DELETE /api/tickets/{id}/comments/{commentId} ────────────────────────

    /**
     * Delete a comment.
     * Author can delete their own comment. ADMIN can delete any comment.
     *
     * Status Codes:
     *   204 No Content – Comment deleted.
     *   403 Forbidden  – Not the author and not an admin.
     *   404 Not Found  – Ticket or comment not found.
     *   500 Internal   – Unexpected error.
     */
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            Authentication authentication) {

        try {
            String userId = SecurityContextUtil.getUserId(authentication);
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            boolean isAdmin = SecurityContextUtil.hasRole(authentication, "ADMIN");

            ticketService.deleteComment(id, commentId, userId, isAdmin);
            return ResponseEntity.noContent().build();

        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, String> createLink(String href) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        return link;
    }

    private Map<String, String> createLinkWithMethod(String href, String method) {
        Map<String, String> link = new HashMap<>();
        link.put("href", href);
        link.put("method", method);
        return link;
    }

    private String buildQueryString(String status, String createdBy, String assignedTo,
                                     String resourceId, int page, int limit) {
        StringBuilder sb = new StringBuilder("?");
        boolean first = true;

        if (status != null && !status.isBlank()) {
            sb.append("status=").append(status);
            first = false;
        }
        if (createdBy != null && !createdBy.isBlank()) {
            if (!first) sb.append("&");
            sb.append("createdBy=").append(createdBy);
            first = false;
        }
        if (assignedTo != null && !assignedTo.isBlank()) {
            if (!first) sb.append("&");
            sb.append("assignedTo=").append(assignedTo);
            first = false;
        }
        if (resourceId != null && !resourceId.isBlank()) {
            if (!first) sb.append("&");
            sb.append("resourceId=").append(resourceId);
            first = false;
        }
        if (!first) sb.append("&");
        sb.append("page=").append(page).append("&limit=").append(limit);

        return sb.toString();
    }

    private String buildMyQueryString(String status, String assignedTo,
                                      String resourceId, int page, int limit) {
        return buildQueryString(status, null, assignedTo, resourceId, page, limit);
    }

    private <T> ResponseEntity<ApiResponse<T>> errorResponse(
            HttpStatus status, String code, String message) {
        ApiResponse<T> error = new ApiResponse<>("error", null);
        error.setError(code, message);
        return ResponseEntity.status(status).body(error);
    }

    private <T> ResponseEntity<ApiResponse<T>> validateTicketAccess(Authentication authentication, TicketResponse ticket) {
        String userId = SecurityContextUtil.getUserId(authentication);
        if (userId == null || userId.isBlank()) {
            return errorResponse(HttpStatus.UNAUTHORIZED,
                    "UNAUTHORIZED",
                    "Missing or invalid bearer token: user id (sub) claim not found");
        }

        boolean privileged = SecurityContextUtil.hasRole(authentication, "ADMIN")
                || SecurityContextUtil.hasRole(authentication, "TECHNICIAN");
        boolean ownerOrAssignee = userId.equals(ticket.getCreatedBy()) || userId.equals(ticket.getAssignedTo());

        if (!privileged && !ownerOrAssignee) {
            return errorResponse(HttpStatus.FORBIDDEN,
                    "FORBIDDEN", "You can only access your own tickets");
        }
        return null;
    }
}