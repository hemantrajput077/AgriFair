package com.agri.marketplace.AgriFair.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Crop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String productName;

    private String description;

    private double price;

    private int quantity;

    private boolean organic;

    private String photoUrl;

    @ManyToOne
    @JoinColumn(name = "farmer_id") 
    private User farmer;
}

