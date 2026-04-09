package com.smartcampus.backend.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Notifications") // table name
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id //primary key
    @Column(name = "Id")
    private String id;

    @Column(name = "UserId", nullable = false)
    private String userId;

    @Column(name = "Type", nullable = false)
    private String type;
    
    @Column(name = "Title", nullable = false)
    private String title;
    
    @Column(name = "Message", nullable = false)
    private String message;
    
    @Column(name = "ReferenceId")
    private String referenceId;

    @Builder.Default
    @Column(name = "IsRead")
    private Boolean read = false;

    @Column(name = "CreatedAt",nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate(){
        if (createdAt == null){
            createdAt = LocalDateTime.now();
        }
        if (read == null){
            read = false;
        }
    }
}
