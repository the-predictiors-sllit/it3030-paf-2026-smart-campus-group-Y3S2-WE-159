package com.smartcampus.backend.repository;

import com.smartcampus.backend.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for the Ticket entity.
 * Spring Data JPA generates the SQL automatically from these method names.
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {

    /** All tickets reported by a specific user ("My Tickets" view). */
    List<Ticket> findByCreatedBy(String createdBy);

    /** All tickets assigned to a specific technician. */
    List<Ticket> findByAssignedTo(String assignedTo);

    /** All tickets linked to a specific resource (room / lab / equipment). */
    List<Ticket> findByResourceId(String resourceId);

    /** All tickets with a given status – e.g. all OPEN tickets. */
    List<Ticket> findByStatus(String status);

    /** "My open tickets" – filter by creator AND status. */
    List<Ticket> findByCreatedByAndStatus(String createdBy, String status);

    /** Filter by resource AND status – e.g. all OPEN tickets for Lab 3. */
    List<Ticket> findByResourceIdAndStatus(String resourceId, String status);
}