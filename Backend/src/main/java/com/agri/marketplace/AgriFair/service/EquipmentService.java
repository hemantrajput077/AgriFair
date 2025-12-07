package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.Equipment;
import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.repository.EquipmentRepository;
import com.agri.marketplace.AgriFair.repository.FarmerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final FarmerRepository farmerRepository;
    private final FileStorageService fileStorageService;

    public EquipmentService(EquipmentRepository equipmentRepository, 
                           FarmerRepository farmerRepository,
                           FileStorageService fileStorageService) {
        this.equipmentRepository = equipmentRepository;
        this.farmerRepository = farmerRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Equipment> getEquipments() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    public List<Equipment> getAvailableEquipments() {
        return equipmentRepository.findByAvailable(Boolean.TRUE);
    }

    public List<Equipment> getEquipmentsByOwner(Long ownerId) {
        return equipmentRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public Equipment createEquipment(Equipment equipment, MultipartFile imageFile, String username) {
        // Get farmer by username (auto-assign owner from logged-in user)
        Farmer owner;
        if (username != null && !username.isEmpty()) {
            // Find User by username, then find Farmer by matching email
            com.agri.marketplace.AgriFair.model.User user = 
                com.agri.marketplace.AgriFair.repository.UserRepository.findByUsername(username);
            if (user == null) {
                throw new EntityNotFoundException("User not found: " + username);
            }
            owner = farmerRepository.findByEmail(user.getEmail())
                .orElseThrow(() -> new EntityNotFoundException(
                    "Farmer profile not found for user: " + username + ". Please complete your farmer profile."));
        } else {
            // Fallback: use owner from equipment if provided (for backward compatibility)
            Long ownerId = Optional.ofNullable(equipment.getOwner())
                    .map(Farmer::getId)
                    .orElseThrow(() -> new IllegalArgumentException("Equipment owner is required"));
            owner = farmerRepository.findById(ownerId)
                    .orElseThrow(() -> new EntityNotFoundException("Owner not found: " + ownerId));
        }

        equipment.setOwner(owner);
        if (equipment.getAvailable() == null) {
            equipment.setAvailable(Boolean.TRUE);
        }

        // Handle image upload
        try {
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = fileStorageService.storeFile(imageFile);
                equipment.setImageUrl(imageUrl);
            } else if (equipment.getImageUrl() != null && !equipment.getImageUrl().isEmpty()) {
                // Allow URL if no file uploaded
                // imageUrl already set
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
        }

        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment updateAvailability(Long equipmentId, boolean available) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found: " + equipmentId));
        equipment.setAvailable(available);
        return equipmentRepository.save(equipment);
    }
}

