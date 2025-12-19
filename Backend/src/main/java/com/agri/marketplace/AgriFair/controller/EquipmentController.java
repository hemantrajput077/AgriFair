package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.model.Equipment;
import com.agri.marketplace.AgriFair.service.EquipmentService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipments")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<Equipment> getEquipments() {
        return equipmentService.getEquipments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/available")
    public List<Equipment> getAvailableEquipments() {
        return equipmentService.getAvailableEquipments();
    }

    @GetMapping("/owner/{ownerId}")
    public List<Equipment> getEquipmentsByOwner(@PathVariable Long ownerId) {
        return equipmentService.getEquipmentsByOwner(ownerId);
    }

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createEquipment(
            @RequestPart("equipment") @Valid Equipment equipment,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            Authentication auth) {
        try {
            if (equipment == null) {
                return ResponseEntity.badRequest().body("Equipment data is required");
            }
            
            // Auto-assign owner from logged-in user
            String username = auth.getName();
            Equipment created = equipmentService.createEquipment(equipment, imageFile, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (EntityNotFoundException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing request: " + e.getMessage());
        }
    }
}



