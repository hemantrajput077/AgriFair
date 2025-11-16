package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.dto.CropRequestDto;
import com.agri.marketplace.AgriFair.dto.CropResponseDto;
import com.agri.marketplace.AgriFair.service.CropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/crops")
public class CropController {

    @Autowired
    private CropService cropService;

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addCrop(
            @RequestPart("crop") CropRequestDto cropDto,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            Authentication auth) {
        try {
            if (cropDto == null) {
                return ResponseEntity.badRequest().body("Crop data is required");
            }
            
            return ResponseEntity.ok(cropService.addCrop(auth, cropDto, imageFile));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error processing request: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @GetMapping("/my")
    public ResponseEntity<List<CropResponseDto>> getMyCrops(Authentication auth) {
        return ResponseEntity.ok(cropService.getCropsByFarmer(auth));
    }

    // Public endpoint to list all crops (for customers to browse)
    @GetMapping
    public ResponseEntity<List<CropResponseDto>> getAllCrops() {
        return ResponseEntity.ok(cropService.getAllCrops());
    }

    // Add update and delete endpoints with ownership checks as needed
}

