package com.agri.marketplace.AgriFair.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role;  // e.g., ROLE_FARMER, ROLE_CUSTOMER

    // Profile fields
    private String fullName;

    private String phoneNumber;

    private String profileImage;  // URL to profile image

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String bio;  // Short description about the user

    // Farmer-specific fields
    private String farmName;

    private Double farmSize;  // in acres

    private String farmingType;  // Organic, Conventional, Mixed

    private Integer yearsOfExperience;

    // Customer-specific fields
    private String preferredDeliveryTime;

    // Common fields
    private Boolean isVerified = false;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}