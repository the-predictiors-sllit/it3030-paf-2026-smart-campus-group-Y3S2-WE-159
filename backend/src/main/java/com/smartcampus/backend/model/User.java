package com.smartcampus.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Users") 
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "Id", length = 50) 
    private String id; 

    @Column(name = "Name", nullable = false, length = 100)
    private String name;

    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "ImageUrl")
    private String imageUrl;

    // @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false, length = 20)
    private String role;
    // private Role role;
    
    @Column(name = "CreatedAt",nullable = false)
    private LocalDateTime createdAt;

    // public enum Role {
    //     USER, ADMIN, TECHNICIAN
    // }
}