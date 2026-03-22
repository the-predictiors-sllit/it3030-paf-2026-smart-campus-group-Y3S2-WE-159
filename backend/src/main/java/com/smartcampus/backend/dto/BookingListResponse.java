package com.smartcampus.backend.dto;

import java.time.Instant;
import java.util.List;

import com.smartcampus.backend.model.BookingStatus;

public class BookingListResponse {

    private List<Item> items;
    private long total;

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public static class Item {
        private String id;
        private ResourceSummary resource;
        private Instant startTime;
        private Instant endTime;
        private BookingStatus status;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public ResourceSummary getResource() {
            return resource;
        }

        public void setResource(ResourceSummary resource) {
            this.resource = resource;
        }

        public Instant getStartTime() {
            return startTime;
        }

        public void setStartTime(Instant startTime) {
            this.startTime = startTime;
        }

        public Instant getEndTime() {
            return endTime;
        }

        public void setEndTime(Instant endTime) {
            this.endTime = endTime;
        }

        public BookingStatus getStatus() {
            return status;
        }

        public void setStatus(BookingStatus status) {
            this.status = status;
        }
    }

    public static class ResourceSummary {
        private String id;
        private String name;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
