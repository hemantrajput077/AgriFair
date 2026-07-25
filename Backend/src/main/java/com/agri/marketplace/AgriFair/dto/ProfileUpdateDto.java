package com.agri.marketplace.AgriFair.dto;

import lombok.Data;

@Data
public class ProfileUpdateDto {
    private String fullName;
    private String phoneNumber;
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
}
