package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.*;
import com.smartcampus.backend.model.Notification;
import com.smartcampus.backend.model.Ticket;
import com.smartcampus.backend.model.TicketAttachment;
import com.smartcampus.backend.model.TicketComment;
import com.smartcampus.backend.repository.TicketAttachmentRepository;
import com.smartcampus.backend.repository.TicketCommentRepository;
import com.smartcampus.backend.repository.TicketRepository;
import com.smartcampus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles all business logic:
 * - Creating tickets with attachment linking
 * - Updating ticket status / assigning technicians
 * - Adding, editing and deleting comments (with ownership checks)
 * - Listing and filtering tickets
 * - Deleting tickets (admin only)
 */
@Service
@Transactional
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private TicketAttachmentRepository attachmentRepository;

    @Autowired
    private TicketCommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinioService minioService;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter ID_FORMATTER =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private static final int MAX_ATTACHMENTS = 3;

    // ── Valid value sets ──────────────────────────────────────────────────────

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "HARDWARE", "PLUMBING", "ELECTRICAL", "SOFTWARE", "OTHER");

    private static final Set<String> VALID_PRIORITIES = Set.of(
            "LOW", "MEDIUM", "HIGH", "CRITICAL");

    private static final Set<String> VALID_STATUSES = Set.of(
            "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED");

    // ── CREATE ────────────────────────────────────────────────────────────────

    /**
     * Creates a new incident ticket.
     *
     * Flow:
     * 1. Validate the request fields.
     * 2. Generate a unique ticket ID.
     * 3. Save the Ticket row.
     * 4. Save one TicketAttachment row per generatedFileName provided.
     * 5. Return the full TicketResponse.
     *
     * @param request The incoming create request.
     * @param userId  The ID of the authenticated user making the report.
     * @return TicketResponse with the saved ticket details.
     */
    public TicketResponse createTicket(CreateTicketRequest request, String userId) {
        validateCreateRequest(request);

        // Generate unique ticket ID – same pattern as booking IDs
        String ticketId = generateTicketId(userId);

        // Build and save the Ticket entity
        Ticket ticket = new Ticket(
                ticketId,
                request.getResourceId(),
                request.getLocation(),
                request.getCategory().toUpperCase(),
                request.getPriority().toUpperCase(),
                request.getDescription(),
                request.getContactPhone(),
                userId
        );
        Ticket newTicket = ticketRepository.save(ticket);

        // for notification:by pasan
        Notification notification = Notification.builder()
                .userId(userId) // target user
                .type("NEW_TICKET")
                .title("New Incident Ticket")
                .message(NotificationTemplates.TicketCreate(newTicket.getCreatedAt(), newTicket.getResourceId(),newTicket.getId()))
                .referenceId(newTicket.getId())
                .read(false)
                .build();

        notificationService.createNotification(notification);



        // Save attachment records (files are already in Minio)
        List<String> savedFileNames = new ArrayList<>();
        if (request.getAttachments() != null) {
            for (String fileName : request.getAttachments()) {
                TicketAttachment attachment = new TicketAttachment(ticketId, fileName);
                attachmentRepository.save(attachment);
                savedFileNames.add(fileName);
            }
        }

        return convertToTicketResponse(ticket, savedFileNames, Collections.emptyList());
    }

    // READ (single)

    /**
     * Returns full details for one ticket including attachments and comments.
     *
     * @param ticketId The ticket ID.
     * @return Full TicketResponse.
     * @throws NoSuchElementException if the ticket does not exist.
     */
    public TicketResponse getTicket(String ticketId) {
        Ticket ticket = findTicketOrThrow(ticketId);
        List<String> fileNames = getAttachmentFileNames(ticketId);
        List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return convertToTicketResponse(ticket, fileNames, comments);
    }

    // READ (list)

    /**
     * Returns a paginated list of tickets with optional filters.
     *
     * Supported filters (all optional, combinable):
     * - status     : e.g. OPEN
     * - createdBy  : filter to one user's tickets
     * - assignedTo : filter to a technician's assigned tickets
     * - resourceId : filter to tickets for a specific resource
     *
     * @param createdBy  Optional user ID of the reporter.
     * @param assignedTo Optional user ID of the assigned technician.
     * @param resourceId Optional resource ID.
     * @param status     Optional ticket status.
     * @param page       Page number (1-indexed, matches BookingService).
     * @param limit      Items per page.
     * @return Paginated ListTicketsResponse.
     */
    public ListTicketsResponse listTickets(String createdBy, String assignedTo,
                                           String resourceId, String status,
                                           int page, int limit) {
        // Validate status if provided
        String normalisedStatus = normaliseStatus(status);

        // Fetch all matching tickets then apply pagination in memory
        // (consistent with how BookingService handles filtering)
        List<Ticket> tickets = fetchFiltered(createdBy, assignedTo, resourceId, normalisedStatus);

        // Sort newest first
        tickets.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));

        // Pagination
        int validPage  = Math.max(page, 1);
        int validLimit = Math.max(limit, 1);
        int total      = tickets.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / validLimit);
        int startIdx   = (validPage - 1) * validLimit;
        int endIdx     = Math.min(startIdx + validLimit, total);

        List<TicketListItem> items = startIdx >= total
                ? Collections.emptyList()
                : tickets.subList(startIdx, endIdx)
                        .stream()
                        .map(this::convertToTicketListItem)
                        .collect(Collectors.toList());

        return new ListTicketsResponse(items, total, validPage, totalPages);
    }

    //  UPDATE (ticket) 

    /**
     * Partially updates a ticket's status, assigned technician, or resolution notes.
     *
     * Rules:
     * - Only non-null fields in the request are applied.
     * - Status transitions must be valid (e.g. cannot move CLOSED → OPEN).
     * - assignedTo must be a valid userId (caller should verify role; security config handles this).
     *
     * @param ticketId The ticket to update.
     * @param request  Fields to update (all optional).
     * @return Updated TicketResponse.
     * @throws NoSuchElementException   if ticket not found.
     * @throws IllegalArgumentException if the new status is invalid or transition is not allowed.
     */
    public TicketResponse updateTicket(String ticketId, UpdateTicketRequest request) {
        Ticket ticket = findTicketOrThrow(ticketId);

        // Apply status change if provided
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().trim().toUpperCase();
            if (!VALID_STATUSES.contains(newStatus)) {
                throw new IllegalArgumentException(
                        "Invalid status: " + request.getStatus() +
                        ". Must be one of: " + VALID_STATUSES);
            }
            validateStatusTransition(ticket.getStatus(), newStatus);
            ticket.setStatus(newStatus);
        }

        // Apply technician assignment if provided
        if (request.getAssignedTo() != null && !request.getAssignedTo().isBlank()) {
            ticket.setAssignedTo(request.getAssignedTo().trim());
        }

        // Apply resolution notes if provided
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket ticketStatus = ticketRepository.save(ticket);


        // for notification:by pasan
        Notification notification = Notification.builder()
                .userId(ticketStatus.getCreatedBy()) // target user
                .type("TICKET_STATUS_UPDATE")
                .title("Ticket Status Update")
                .message(NotificationTemplates.TicketStatusUpdate(ticketStatus.getStatus(), ticketStatus.getResourceId(),ticketStatus.getId(),ticketStatus.getResolutionNotes()))
                .referenceId(ticketStatus.getId())
                .read(false)
                .build();

        notificationService.createNotification(notification);


        List<String> fileNames = getAttachmentFileNames(ticketId);
        List<TicketComment> comments = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        return convertToTicketResponse(ticket, fileNames, comments);
    }

    // ── DELETE (ticket) ───────────────────────────────────────────────────────

    /**
     * Deletes a ticket and all its attachments from both the database and Minio.
     * Intended for ADMIN use only (role check handled by SecurityConfig).
     *
     * @param ticketId The ticket to delete.
     * @throws NoSuchElementException if the ticket does not exist.
     */
    public void deleteTicket(String ticketId) {
        Ticket ticket = findTicketOrThrow(ticketId);

        // Delete each attachment file from Minio first
        List<TicketAttachment> attachments = attachmentRepository.findByTicketId(ticketId);
        for (TicketAttachment attachment : attachments) {
            try {
                minioService.deleteFile(attachment.getGeneratedFileName());
            } catch (Exception e) {
                // Log and continue – don't let a Minio error block the DB delete
                System.err.println("Warning: could not delete file from Minio: "
                        + attachment.getGeneratedFileName() + " – " + e.getMessage());
            }
        }

        // Delete comments, attachments, then the ticket (order matters for FK constraints)
        commentRepository.deleteAll(
                commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId));
        attachmentRepository.deleteAll(attachments);
        ticketRepository.delete(ticket);
    }

    // ── COMMENTS: ADD ─────────────────────────────────────────────────────────

    /**
     * Adds a comment to a ticket.
     * Any authenticated user (USER / ADMIN / TECHNICIAN) can comment.
     *
     * @param ticketId The ticket to comment on.
     * @param request  The comment text.
     * @param authorId The user ID of the person adding the comment.
     * @return TicketCommentResponse with the saved comment.
     * @throws NoSuchElementException   if the ticket does not exist.
     * @throws IllegalArgumentException if the text is blank.
     */
    public TicketCommentResponse addComment(String ticketId,
                                             AddCommentRequest request,
                                             String authorId) {
        findTicketOrThrow(ticketId); // ensure ticket exists

        if (request.getText() == null || request.getText().isBlank()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }

        String commentId = generateCommentId(authorId);
        TicketComment comment = new TicketComment(
                commentId,
                ticketId,
                authorId,
                request.getText().trim()
        );
        commentRepository.save(comment);



        return convertToCommentResponse(comment);
    }

    // ── COMMENTS: UPDATE ──────────────────────────────────────────────────────

    /**
     * Updates the text of an existing comment.
     * Only the original author can edit their own comment.
     *
     * @param ticketId  The parent ticket ID.
     * @param commentId The comment to edit.
     * @param request   New text.
     * @param userId    The currently authenticated user (must match comment author).
     * @return Updated TicketCommentResponse.
     * @throws NoSuchElementException   if ticket or comment not found.
     * @throws SecurityException        if the user is not the comment's author.
     * @throws IllegalArgumentException if the text is blank.
     */
    public TicketCommentResponse updateComment(String ticketId, String commentId,
                                               UpdateCommentRequest request,
                                               String userId) {
        findTicketOrThrow(ticketId);

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));

        // Ownership check
        if (!comment.getAuthorId().equals(userId)) {
            throw new SecurityException("You can only edit your own comments");
        }

        if (request.getText() == null || request.getText().isBlank()) {
            throw new IllegalArgumentException("Comment text cannot be empty");
        }

        comment.setText(request.getText().trim());
        comment.setUpdatedAt(LocalDateTime.now());
        commentRepository.save(comment);

        return convertToCommentResponse(comment);
    }

    // COMMENTS: DELETE 

    /**
     * Deletes a comment.
     * Only the original author OR an ADMIN can delete a comment.
     *
     * @param ticketId  The parent ticket ID.
     * @param commentId The comment to delete.
     * @param userId    The currently authenticated user.
     * @param isAdmin   Pass true if the caller has the ADMIN role.
     * @throws NoSuchElementException if ticket or comment not found.
     * @throws SecurityException      if the user is not the author and is not an admin.
     */
    public void deleteComment(String ticketId, String commentId,
                               String userId, boolean isAdmin) {
        findTicketOrThrow(ticketId);

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found: " + commentId));

        // Ownership check: must be the author OR an admin
        if (!comment.getAuthorId().equals(userId) && !isAdmin) {
            throw new SecurityException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    // COMMENTS: LIST

    /**
     * Returns all comments for a ticket, ordered oldest-first.
     *
     * @param ticketId The ticket ID.
     * @return List of TicketCommentResponse.
     * @throws NoSuchElementException if the ticket does not exist.
     */
    public List<TicketCommentResponse> listComments(String ticketId) {
        findTicketOrThrow(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::convertToCommentResponse)
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Finds a ticket or throws a clear 404-style exception. */
    private Ticket findTicketOrThrow(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found: " + ticketId));
    }

    /** Returns just the file name strings for a ticket's attachments. */
    private List<String> getAttachmentFileNames(String ticketId) {
        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(TicketAttachment::getGeneratedFileName)
                .collect(Collectors.toList());
    }

    /**
     * Applies filter combinations and returns the matching tickets.
     * Mirrors the filtering approach used in BookingService.listBookings().
     */
    private List<Ticket> fetchFiltered(String createdBy, String assignedTo,
                                        String resourceId, String status) {
        // All filters null → return everything
        if (isBlank(createdBy) && isBlank(assignedTo)
                && isBlank(resourceId) && isBlank(status)) {
            return ticketRepository.findAll();
        }

        // Single-field filters
        if (!isBlank(createdBy) && isBlank(assignedTo)
                && isBlank(resourceId) && isBlank(status)) {
            return ticketRepository.findByCreatedBy(createdBy);
        }
        if (!isBlank(assignedTo) && isBlank(createdBy)
                && isBlank(resourceId) && isBlank(status)) {
            return ticketRepository.findByAssignedTo(assignedTo);
        }
        if (!isBlank(resourceId) && isBlank(createdBy)
                && isBlank(assignedTo) && isBlank(status)) {
            return ticketRepository.findByResourceId(resourceId);
        }
        if (!isBlank(status) && isBlank(createdBy)
                && isBlank(assignedTo) && isBlank(resourceId)) {
            return ticketRepository.findByStatus(status);
        }

        // Two-field filters
        if (!isBlank(createdBy) && !isBlank(status)
                && isBlank(assignedTo) && isBlank(resourceId)) {
            return ticketRepository.findByCreatedByAndStatus(createdBy, status);
        }
        if (!isBlank(resourceId) && !isBlank(status)
                && isBlank(createdBy) && isBlank(assignedTo)) {
            return ticketRepository.findByResourceIdAndStatus(resourceId, status);
        }

        // Fallback: fetch all and filter in-memory for complex combinations
        List<Ticket> all = ticketRepository.findAll();
        return all.stream()
                .filter(t -> isBlank(createdBy)  || createdBy.equals(t.getCreatedBy()))
                .filter(t -> isBlank(assignedTo) || assignedTo.equals(t.getAssignedTo()))
                .filter(t -> isBlank(resourceId) || resourceId.equals(t.getResourceId()))
                .filter(t -> isBlank(status)     || status.equals(t.getStatus()))
                .collect(Collectors.toList());
    }

    /** Validates required fields on a CreateTicketRequest. */
    private void validateCreateRequest(CreateTicketRequest request) {
        // At least one of resourceId or location must be present
        if (isBlank(request.getResourceId()) && isBlank(request.getLocation())) {
            throw new IllegalArgumentException(
                    "Either resourceId or location must be provided");
        }

        if (isBlank(request.getCategory())) {
            throw new IllegalArgumentException("Category is required");
        }
        if (!VALID_CATEGORIES.contains(request.getCategory().toUpperCase())) {
            throw new IllegalArgumentException(
                    "Invalid category: " + request.getCategory() +
                    ". Must be one of: " + VALID_CATEGORIES);
        }

        if (isBlank(request.getPriority())) {
            throw new IllegalArgumentException("Priority is required");
        }
        if (!VALID_PRIORITIES.contains(request.getPriority().toUpperCase())) {
            throw new IllegalArgumentException(
                    "Invalid priority: " + request.getPriority() +
                    ". Must be one of: " + VALID_PRIORITIES);
        }

        if (isBlank(request.getDescription())) {
            throw new IllegalArgumentException("Description is required");
        }
        if (request.getDescription().trim().length() < 10) {
            throw new IllegalArgumentException(
                    "Description must be at least 10 characters long");
        }

        // Attachment limit
        if (request.getAttachments() != null
                && request.getAttachments().size() > MAX_ATTACHMENTS) {
            throw new IllegalArgumentException(
                    "Maximum " + MAX_ATTACHMENTS + " attachments allowed per ticket");
        }
    }

    /**
     * Validates that a status transition makes business sense.
     *
     * Allowed transitions:
     *   OPEN        → IN_PROGRESS, REJECTED
     *   IN_PROGRESS → RESOLVED, REJECTED
     *   RESOLVED    → CLOSED
     *   CLOSED      → (no further changes allowed)
     *   REJECTED    → (no further changes allowed)
     */
    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Same status – always allowed (idempotent update)
        if (currentStatus.equals(newStatus)) return;

        boolean allowed = switch (currentStatus) {
            case "OPEN"        -> Set.of("IN_PROGRESS", "REJECTED").contains(newStatus);
            case "IN_PROGRESS" -> Set.of("RESOLVED", "REJECTED").contains(newStatus);
            case "RESOLVED"    -> newStatus.equals("CLOSED");
            case "CLOSED"      -> false;
            case "REJECTED"    -> false;
            default            -> false;
        };

        if (!allowed) {
            throw new IllegalArgumentException(
                    "Cannot transition ticket from " + currentStatus + " to " + newStatus);
        }
    }

    /** Normalises and validates an optional status filter string. */
    private String normaliseStatus(String status) {
        if (isBlank(status)) return null;
        String upper = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(upper)) {
            throw new IllegalArgumentException(
                    "Invalid status filter: " + status +
                    ". Must be one of: " + VALID_STATUSES);
        }
        return upper;
    }

    /**
     * Generates a unique ticket ID.
     * Format: tck_{yyyyMMddHHmmss}_{userNumericSuffix}
     * Example: tck_20260410093000_1001
     */
    private String generateTicketId(String userId) {
        String timestamp  = LocalDateTime.now().format(ID_FORMATTER);
        String userSuffix = userId.replaceAll("[^0-9]", "");
        if (userSuffix.isEmpty()) userSuffix = userId;
        userSuffix = userSuffix.substring(0, Math.min(4, userSuffix.length()));
        return "tck_" + timestamp + "_" + userSuffix;
    }

    /**
     * Generates a unique comment ID.
     * Format: cmt_{yyyyMMddHHmmss}_{userNumericSuffix}
     * Example: cmt_20260410093015_1001
     */
    private String generateCommentId(String userId) {
        String timestamp  = LocalDateTime.now().format(ID_FORMATTER);
        String userSuffix = userId.replaceAll("[^0-9]", "");
        if (userSuffix.isEmpty()) userSuffix = userId;
        userSuffix = userSuffix.substring(0, Math.min(4, userSuffix.length()));
        return "cmt_" + timestamp + "_" + userSuffix;
    }

    /** Converts a Ticket entity to a full TicketResponse (includes comments). */
    private TicketResponse convertToTicketResponse(Ticket ticket,
                                                    List<String> fileNames,
                                                    List<TicketComment> comments) {
        List<TicketResponse.CommentInfo> commentInfos = comments.stream()
                .map(c -> new TicketResponse.CommentInfo(
                        c.getId(), c.getAuthorId(), c.getText(),
                        c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toList());

        TicketResponse.ResourceInfo resourceInfo = null;
        if (!isBlank(ticket.getResourceId())) {
            resourceInfo = new TicketResponse.ResourceInfo(
                ticket.getResourceId(),
                "Resource " + ticket.getResourceId());
        }

        return new TicketResponse(
                ticket.getId(),
            resourceInfo,
                ticket.getLocation(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getDescription(),
                ticket.getContactPhone(),
                ticket.getCreatedBy(),
                ticket.getAssignedTo(),
                ticket.getResolutionNotes(),
                fileNames,
                commentInfos,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );
    }

    /** Converts a Ticket entity to a compact TicketListItem (no comments). */
    private TicketListItem convertToTicketListItem(Ticket ticket) {
        TicketListItem.ResourceInfo resourceInfo = null;
        if (!isBlank(ticket.getResourceId())) {
            resourceInfo = new TicketListItem.ResourceInfo(
                ticket.getResourceId(),
                "Resource " + ticket.getResourceId());
        }

        TicketListItem item = new TicketListItem(
                ticket.getId(),
            resourceInfo,
                ticket.getLocation(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getCreatedBy(),
                ticket.getAssignedTo(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt()
        );

        // HATEOAS links (same pattern as BookingService)
        Map<String, String> selfLink = new HashMap<>();
        selfLink.put("href", "/api/tickets/" + ticket.getId());
        item.addLink("self", selfLink);

        Map<String, String> commentsLink = new HashMap<>();
        commentsLink.put("href", "/api/tickets/" + ticket.getId() + "/comments");
        item.addLink("comments", commentsLink);

        return item;
    }

    /** Converts a TicketComment entity to a TicketCommentResponse. */
    private TicketCommentResponse convertToCommentResponse(TicketComment comment) {
        // Fetch author name from User repository
        String authorName = userRepository.findById(comment.getAuthorId())
                .map(user -> user.getName())
                .orElse("Unknown User");
        
        return new TicketCommentResponse(
                comment.getId(),
                comment.getTicketId(),
                comment.getAuthorId(),
                authorName,
                comment.getText(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    /** Null-safe blank check. */
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}