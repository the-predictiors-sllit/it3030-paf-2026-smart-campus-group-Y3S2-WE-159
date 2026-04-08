package com.smartcampus.backend.dto;

import java.util.List;

/* DTO for paginated list of bookings response.*/
public class ListBookingsResponse {
    private List<BookingListItem> items;
    private int total;
    private int page;
    private int totalPages;

    // Constructors
    public ListBookingsResponse() {
    }

    public ListBookingsResponse(List<BookingListItem> items, int total, int page, int totalPages) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.totalPages = totalPages;
    }

    // Getters and Setters
    public List<BookingListItem> getItems() {
        return items;
    }

    public void setItems(List<BookingListItem> items) {
        this.items = items;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
