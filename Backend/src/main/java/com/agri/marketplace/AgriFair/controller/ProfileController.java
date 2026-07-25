package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.dto.ProfileResponseDto;
import com.agri.marketplace.AgriFair.dto.ProfileUpdateDto;
import com.agri.marketplace.AgriFair.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    /**
     * Get current user's profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            ProfileResponseDto profile = profileService.getProfile(auth.getName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    /**
     * Get user profile by username (public)
     */
    @GetMapping("/{username}")
    public ResponseEntity<?> getProfileByUsername(@PathVariable String username) {
        try {
            ProfileResponseDto profile = profileService.getProfile(username);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    /**
     * Update profile (text fields only)
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(
            @RequestBody ProfileUpdateDto updateDto,
            Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            ProfileResponseDto profile = profileService.updateProfile(auth.getName(), updateDto);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating profile: " + e.getMessage());
        }
    }

    /**
     * Upload/Update profile image
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfileImage(
            @RequestPart("image") MultipartFile imageFile,
            Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            if (imageFile == null || imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Image file is required");
            }

            ProfileResponseDto profile = profileService.updateProfileImage(auth.getName(), imageFile);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading image: " + e.getMessage());
        }
    }

    /**
     * Delete profile image
     */
    @DeleteMapping("/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProfileImage(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            ProfileResponseDto profile = profileService.deleteProfileImage(auth.getName());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting image: " + e.getMessage());
        }
    }
}
