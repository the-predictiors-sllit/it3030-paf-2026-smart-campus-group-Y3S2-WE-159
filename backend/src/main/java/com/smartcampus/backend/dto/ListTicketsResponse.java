package com.smartcampus.backend.dto;

import java.util.List;

/**
 * Paginated response wrapper for GET /api/tickets.
 * Mirrors the structure of ListBookingsResponse used in Module B.
 */
public class ListTicketsResponse {

    private List<TicketListItem> items;
    private int total;
    private int page;
    private int totalPages;

    // ── Constructor ───────────────────────────────────────────────────────────

    public ListTicketsResponse() {}

    public ListTicketsResponse(List<TicketListItem> items, int total, int page, int totalPages) {
        this.items      = items;
        this.total      = total;
        this.page       = page;
        this.totalPages = totalPages;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public List<TicketListItem> getItems() { return items; }
    public void setItems(List<TicketListItem> items) { this.items = items; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}