package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.service.FarmerService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/farmers")
public class FarmerController {

    private final FarmerService farmerService;

    public FarmerController(FarmerService farmerService) {
        this.farmerService = farmerService;
    }

    @GetMapping
    public List<Farmer> getFarmers() {
        return farmerService.getFarmers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Farmer> getFarmerById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(farmerService.getFarmerById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Farmer> createFarmer(@Valid @RequestBody Farmer farmer) {
        Farmer created = farmerService.createFarmer(farmer);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        try {
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
            }
            String username = auth.getName();
            return ResponseEntity.ok(farmerService.getMyFarmerProfile(username));
        } catch (EntityNotFoundException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @PutMapping("/my-profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody Farmer updatedFarmer, Authentication auth) {
        try {
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required.");
            }
            String username = auth.getName();
            Farmer updated = farmerService.updateFarmerProfile(username, updatedFarmer);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException | IllegalStateException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}

