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
     */
    public Farmer getFarmerByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new EntityNotFoundException("User not found: " + username);
        }
        
        Optional<Farmer> farmer = farmerRepository.findByEmail(user.getEmail());
        if (farmer.isEmpty()) {
            throw new EntityNotFoundException("Farmer profile not found for user: " + username + ". Please complete your farmer profile.");
        }
        
        return farmer.get();
    }

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        farmerRepository.findByEmail(farmer.getEmail())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email already registered: " + existing.getEmail());
                });

        farmerRepository.findByPhoneNo(farmer.getPhoneNo())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Phone already registered: " + existing.getPhoneNo());
                });

        // Try to link with User if exists
        User user = userRepository.findByEmail(farmer.getEmail());
        if (user != null) {
            farmer.setUserId(user.getId());
        }

        return farmerRepository.save(farmer);
    }
}

