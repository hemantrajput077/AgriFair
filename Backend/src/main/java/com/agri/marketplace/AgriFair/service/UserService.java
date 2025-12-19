package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FarmerService farmerService;

    @Transactional
    public User registerUser(User user) {
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Set role if needed, e.g. ROLE_CUSTOMER as default
        if (user.getRole() == null) {
            user.setRole("ROLE_CUSTOMER");
        }
        User savedUser = userRepository.save(user);
        
        // Auto-create farmer profile if user is registering as ROLE_FARMER
        if ("ROLE_FARMER".equals(savedUser.getRole())) {
            try {
                // Check if farmer profile already exists
                Optional<Farmer> existingFarmer = farmerService.getFarmers().stream()
                    .filter(f -> f.getEmail().equals(savedUser.getEmail()))
                    .findFirst();
                
                if (existingFarmer.isEmpty()) {
                    // Create a basic farmer profile with user's email
                    // User will need to complete profile later with additional details
                    Farmer farmer = new Farmer();
                    farmer.setEmail(savedUser.getEmail());
                    farmer.setFirstName(savedUser.getUsername()); // Use username as default first name
                    farmer.setSecondName(""); // Will be updated later
                    // Phone number will be auto-generated as placeholder by createFarmer method
                    // Don't set phoneNo here - let createFarmer generate a unique placeholder
                    farmer.setCounty("Not Set"); // Placeholder
                    farmer.setLocalArea("Not Set"); // Placeholder
                    if (savedUser.getId() != null) {
                        farmer.setUserId(savedUser.getId());
                    }
                    
                    farmerService.createFarmer(farmer);
                }
            } catch (Exception e) {
                // Log error but don't fail registration
                // Farmer profile can be created later
                System.err.println("Failed to auto-create farmer profile: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return savedUser;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}