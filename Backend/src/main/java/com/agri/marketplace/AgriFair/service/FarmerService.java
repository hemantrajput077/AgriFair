package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.repository.FarmerRepository;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;

    public FarmerService(FarmerRepository farmerRepository, UserRepository userRepository) {
        this.farmerRepository = farmerRepository;
        this.userRepository = userRepository;
    }

    public List<Farmer> getFarmers() {
        return farmerRepository.findAll();
    }

    public Farmer getFarmerById(Long id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + id));
    }

    /**
     * Get farmer by username (finds User by username, then finds Farmer by matching email)
     * Auto-creates farmer profile if it doesn't exist (for existing users or edge cases)
     */
    @Transactional
    public Farmer getFarmerByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new EntityNotFoundException("User not found: " + username);
        }
        
        // Check if user is a farmer
        if (!"ROLE_FARMER".equals(user.getRole())) {
            throw new IllegalStateException("User " + username + " is not registered as a farmer. Please register with ROLE_FARMER.");
        }
        
        Optional<Farmer> farmer = farmerRepository.findByEmail(user.getEmail());
        if (farmer.isEmpty()) {
            // Auto-create farmer profile for existing users who don't have one
            Farmer newFarmer = new Farmer();
            newFarmer.setEmail(user.getEmail());
            newFarmer.setFirstName(user.getUsername()); // Use username as default first name
            newFarmer.setSecondName(""); // Will be updated later
            // Generate unique placeholder phone number (database requires NOT NULL)
            String placeholderPhone = generatePlaceholderPhone(user.getEmail(), user.getId());
            newFarmer.setPhoneNo(placeholderPhone);
            newFarmer.setCounty("Not Set"); // Placeholder
            newFarmer.setLocalArea("Not Set"); // Placeholder
            if (user.getId() != null) {
                newFarmer.setUserId(user.getId());
            }
            
            // Ensure phoneNo is never null before saving
            if (newFarmer.getPhoneNo() == null || newFarmer.getPhoneNo().isEmpty()) {
                newFarmer.setPhoneNo(generatePlaceholderPhone(user.getEmail(), user.getId()));
            }
            
            return createFarmer(newFarmer);
        }
        
        return farmer.get();
    }

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        // Check if farmer with this email already exists
        Optional<Farmer> existingByEmail = farmerRepository.findByEmail(farmer.getEmail());
        if (existingByEmail.isPresent()) {
            // If exists, return existing farmer (for auto-creation during registration)
            return existingByEmail.get();
        }

        // Ensure phone number is never null (database constraint)
        if (farmer.getPhoneNo() == null || farmer.getPhoneNo().isEmpty()) {
            // Generate unique placeholder phone number
            String placeholderPhone = generatePlaceholderPhone(farmer.getEmail(), farmer.getUserId());
            farmer.setPhoneNo(placeholderPhone);
        }
        
        // Check phone uniqueness (skip check for placeholder numbers starting with +91-000000)
        if (!farmer.getPhoneNo().startsWith("+91-000000")) {
            farmerRepository.findByPhoneNo(farmer.getPhoneNo())
                    .ifPresent(existing -> {
                        // Allow same phone if it's the same farmer (updating existing)
                        if (farmer.getId() == null || !existing.getId().equals(farmer.getId())) {
                            throw new IllegalArgumentException("Phone already registered: " + existing.getPhoneNo());
                        }
                    });
        }

        // Try to link with User if exists
        User user = userRepository.findByEmail(farmer.getEmail());
        if (user != null) {
            farmer.setUserId(user.getId());
        }

        // Final safety check - ensure phoneNo is never null
        if (farmer.getPhoneNo() == null || farmer.getPhoneNo().isEmpty()) {
            farmer.setPhoneNo(generatePlaceholderPhone(farmer.getEmail(), farmer.getUserId()));
        }
        
        return farmerRepository.save(farmer);
    }

    /**
     * Get farmer profile by username (for profile management)
     */
    public Farmer getMyFarmerProfile(String username) {
        return getFarmerByUsername(username);
    }

    /**
     * Update farmer profile
     */
    @Transactional
    public Farmer updateFarmerProfile(String username, Farmer updatedFarmer) {
        Farmer existingFarmer = getFarmerByUsername(username);
        
        // Update fields
        if (updatedFarmer.getFirstName() != null && !updatedFarmer.getFirstName().isEmpty()) {
            existingFarmer.setFirstName(updatedFarmer.getFirstName());
        }
        if (updatedFarmer.getSecondName() != null) {
            existingFarmer.setSecondName(updatedFarmer.getSecondName());
        }
        if (updatedFarmer.getPhoneNo() != null && !updatedFarmer.getPhoneNo().isEmpty() 
            && !updatedFarmer.getPhoneNo().startsWith("+91-000000")) {
            // Only update if it's a real phone number (not placeholder)
            existingFarmer.setPhoneNo(updatedFarmer.getPhoneNo());
        }
        if (updatedFarmer.getCounty() != null && !updatedFarmer.getCounty().isEmpty() 
            && !updatedFarmer.getCounty().equals("Not Set")) {
            existingFarmer.setCounty(updatedFarmer.getCounty());
        }
        if (updatedFarmer.getLocalArea() != null && !updatedFarmer.getLocalArea().isEmpty() 
            && !updatedFarmer.getLocalArea().equals("Not Set")) {
            existingFarmer.setLocalArea(updatedFarmer.getLocalArea());
        }
        
        return farmerRepository.save(existingFarmer);
    }

    /**
     * Generate a unique placeholder phone number for farmers who haven't provided one yet.
     * Format: +91-000000{hash}
     * This ensures uniqueness while matching the phone pattern and being clearly identifiable as placeholder.
     */
    private String generatePlaceholderPhone(String email, Long userId) {
        // Use email hash and userId to generate unique placeholder
        int emailHash = email != null ? Math.abs(email.hashCode()) : 0;
        long idValue = userId != null ? userId : 0;
        // Combine with more entropy to ensure uniqueness
        // Use both email hash and userId, with multiplication to spread values
        long combined = Math.abs((long) emailHash * 1000000L + idValue);
        // Take last 6 digits for the hash part
        long hash = combined % 1000000;
        // Format as +91-000000{hash} - starts with zeros to indicate placeholder, ends with unique hash
        String phone = "+91-000000" + String.format("%06d", hash);
        
        // Double-check uniqueness (very rare collision, but handle it)
        Optional<Farmer> existing = farmerRepository.findByPhoneNo(phone);
        if (existing.isPresent() && (userId == null || !existing.get().getUserId().equals(userId))) {
            // If collision, add userId to make it unique
            phone = "+91-000000" + String.format("%06d", (hash + idValue) % 1000000);
        }
        
        return phone;
    }
}

