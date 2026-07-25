package com.agri.marketplace.AgriFair.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProfileResponseDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String fullName;
    private String phoneNumber;
    private String profileImage;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String bio;

    // Farmer-specific fields
    private String farmName;
    private Double farmSize;
    private String farmingType;
    private Integer yearsOfExperience;

    // Customer-specific fields
    private String preferredDeliveryTime;

    // Metadata
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
