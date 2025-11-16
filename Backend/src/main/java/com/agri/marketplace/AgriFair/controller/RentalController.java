package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.model.Rental;
import com.agri.marketplace.AgriFair.service.RentalService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping
    public List<Rental> getAllRentals() {
        return rentalService.getAllRentals();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getRentalById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rentalService.getRentalById(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Rental> getRentalsByFarmer(@PathVariable Long farmerId) {
        return rentalService.getRentalsByFarmer(farmerId);
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<Rental> getRentalsByEquipment(@PathVariable Long equipmentId) {
        return rentalService.getRentalsByEquipment(equipmentId);
    }

    @PostMapping
    public ResponseEntity<?> createRental(@RequestBody Rental rental) {
        try {
            Rental created = rentalService.createRental(rental);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException | IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRental(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rentalService.approveRental(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<?> startRental(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rentalService.startRental(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeRental(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rentalService.completeRental(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRental(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rentalService.cancelRental(id));
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}

