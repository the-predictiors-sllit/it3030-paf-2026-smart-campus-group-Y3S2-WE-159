package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the TicketAttachment entity.
 */
@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Integer> {

    /** All attachments belonging to one ticket. */
    List<TicketAttachment> findByTicketId(String ticketId);

    /**
     * Count attachments for a ticket.
     * Used to enforce the 3-attachment maximum before saving a new one.
     */
    long countByTicketId(String ticketId);

    /**
     * Find an attachment record by its generated file name.
     * Used when associating a pre-uploaded file with a new ticket.
     */
    Optional<TicketAttachment> findByGeneratedFileName(String generatedFileName);
}