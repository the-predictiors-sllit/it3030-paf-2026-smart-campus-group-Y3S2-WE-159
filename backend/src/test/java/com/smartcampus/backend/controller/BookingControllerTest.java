package com.smartcampus.backend.controller;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.smartcampus.backend.dto.BookingListResponse;
import com.smartcampus.backend.dto.BookingResponse;
import com.smartcampus.backend.model.BookingStatus;
import com.smartcampus.backend.service.BookingService;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BookingService bookingService;

    @Test
    void createBooking_shouldReturn201() throws Exception {
        BookingResponse response = new BookingResponse();
        response.setId("bkg_1");
        response.setResourceId("res_2001");
        response.setUserId("usr_1001");
        response.setStatus(BookingStatus.PENDING);

        when(bookingService.createBooking(org.mockito.ArgumentMatchers.any(), eq("usr_1001")))
                .thenReturn(response);

        String body = """
                {
                  \"resourceId\": \"res_2001\",
                  \"startTime\": \"2026-04-10T10:00:00Z\",
                  \"endTime\": \"2026-04-10T12:00:00Z\",
                  \"purpose\": \"Exam\",
                  \"expectedAttendees\": 120
                }
                """;

        mockMvc.perform(post("/api/bookings")
                        .header("X-User-Id", "usr_1001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.id").value("bkg_1"));
    }

    @Test
    void updateBookingStatus_shouldReturn200() throws Exception {
        BookingResponse response = new BookingResponse();
        response.setId("bkg_1");
        response.setResourceId("res_2001");
        response.setStatus(BookingStatus.APPROVED);

        when(bookingService.updateStatus(eq("bkg_1"), org.mockito.ArgumentMatchers.any()))
                .thenReturn(response);

        String body = """
                {
                  \"status\": \"APPROVED\",
                  \"reason\": \"Approved for exam.\"
                }
                """;

        mockMvc.perform(patch("/api/bookings/bkg_1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    void listBookings_shouldReturn200() throws Exception {
        BookingListResponse response = new BookingListResponse();
        BookingListResponse.Item item = new BookingListResponse.Item();
        item.setId("bkg_1");
        item.setStartTime(Instant.parse("2026-04-10T10:00:00Z"));
        item.setEndTime(Instant.parse("2026-04-10T12:00:00Z"));
        item.setStatus(BookingStatus.PENDING);

        BookingListResponse.ResourceSummary resource = new BookingListResponse.ResourceSummary();
        resource.setId("res_2001");
        resource.setName("Main Lecture Hall A");
        item.setResource(resource);

        response.setItems(List.of(item));
        response.setTotal(1);

        when(bookingService.listBookings(BookingStatus.PENDING, "usr_1001")).thenReturn(response);

        mockMvc.perform(get("/api/bookings")
                        .param("status", "PENDING")
                        .param("userId", "usr_1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.total").value(1));
    }
}
