package com.agri.marketplace.AgriFair.dto;

import lombok.Data;

@Data
public class CropResponseDto {
    private Long id;
    private String productName;
    private String description;
    private double price;
    private int quantity;
    private boolean organic;
    private String photoUrl;
    private String farmerUsername;
}
