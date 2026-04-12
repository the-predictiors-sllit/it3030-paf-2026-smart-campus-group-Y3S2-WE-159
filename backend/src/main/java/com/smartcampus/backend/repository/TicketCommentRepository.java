package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for the TicketComment entity.
 */
@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {

    /**
     * All comments for a ticket, ordered oldest-first.
     * This gives a natural conversation thread when displayed in the UI.
     */
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    /** All comments written by a specific user (useful for audit). */
    List<TicketComment> findByAuthorId(String authorId);
}