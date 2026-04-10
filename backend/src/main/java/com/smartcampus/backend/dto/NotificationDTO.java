package com.smartcampus.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private String type;
    private String title;
    private String message;
    private String referenceId;
    private boolean read;
    private LocalDateTime createdAt;

}
