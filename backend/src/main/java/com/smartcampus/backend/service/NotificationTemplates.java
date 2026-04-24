package com.smartcampus.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class NotificationTemplates {
    private static final String baseUrl = "http://localhost:3000";

    public static String formatDateTime(LocalDateTime dateTime) {
        // Create a pattern: "Day-Month-Year Hour:Minute"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        // Convert to String
        return dateTime.format(formatter);
    }

    // --------------------------------------------------------------------
    // --------------------------------------------------------------------

    // booking status

    public static String BookingStatusTitle(String status) {
        switch (status) {
            case "APPROVED":
                return "Booking Approved";
            case "REJECTED":
                return "Booking Rejected";
            case "CANCELLED":
                return "Booking Cancelled";
            default:
                return "Booking Updated";
        }
    }

    public static String BookingStatus(String status, String resource, String reason) {
        String reasonMarkdown = (reason != null) ? "* **Reason**: " + reason : "";

        switch (status) {
            case "APPROVED":
                return """
                        #### Booking Approved

                        Status:`%s`

                        ---

                        Your booking request has been officially approved. You can find the updated details below:
                        * **Resource:**  [Click here](%s/resources/%s)
                        %s
                        """.formatted(status, baseUrl, resource, reasonMarkdown);
            case "REJECTED":
                return """
                        #### Booking Rejected

                        Status:`%s`

                        ---

                        we are unable to approve your request at this time:
                        * **Resource:**  [Click here](%s/resources/%s)
                        %s
                        """.formatted(status, baseUrl, resource, reasonMarkdown);
            case "CANCELLED":
                return """
                        #### Booking Cancelled

                        Status:`%s`

                        ---

                        Your Booking was Cancelled.:
                        * **Resource:**  [Click here](%s/resources/%s)
                        %s
                        """.formatted(status, baseUrl, resource, reasonMarkdown);
            default:
                return "";
        }

    };

    public static String BookingCreate(String status, LocalDateTime createdAt, String resource) {
        String formattedCreatedAt = formatDateTime(createdAt);
        return """

                #### New Booking Request Received

                **Status:** `%s`

                Hello,

                Your request to reserve a campus resource has been successfully submitted. Our administration team will review your request shortly.

                ##### Booking Details:
                * **Submitted On:** %s
                * **Resource:**  [Click here](%s/resources/%s)

                ---

                ##### Next Steps
                1. **Verification:** Our team checks for scheduling conflicts or maintenance windows.
                2. **Notification:** You will receive an notification once the status changes to **Approved** or **Rejected**.
                3. **Check Status:** You can monitor this request at any time via the my bookings page.

                [View My Bookings](%s/booking) · [Campus Guidelines](%s/policy)

                """
                .formatted(status, formattedCreatedAt, baseUrl, resource, baseUrl, baseUrl);
    };

    public static String TicketCreate(LocalDateTime createdAt, String resource, String ticketID) {
        String formattedCreatedAt = formatDateTime(createdAt);

        return """
                You have successfully created a new `Incident Ticket`. Our team will begin processing your request shortly; please await further notification.

                ---
                ##### Ticket Details:
                * **Submitted On:** %s
                * **Resource:** [View Resource](%s/resources/%s)
                * **Ticket ID:** [View Specific Ticket](%s/tickets/myticket/%s)

                ---
                [View All My Tickets](%s/tickets)
                """
                .formatted(formattedCreatedAt, baseUrl, resource, baseUrl, ticketID, baseUrl);
    }


    public static String TicketStatusUpdate(String status, String resource, String ticketID, String note) {

        return """
                ### Your ticket status has been updated to: `%s`.
                
                ---
                **Update Note:**
                > %s

                #### Ticket Details:
                * **Resource:** [View Resource](%s/resources/%s)
                * **Ticket ID:** [View Specific Ticket](%s/tickets/myticket/%s)
                
                ---
                [View All My Tickets](%s/tickets)
                """
                .formatted(status, note, baseUrl, resource, baseUrl, ticketID, baseUrl);
    }

}
